import { readFile, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { CoreEvent, CoreEventParameters, SkinConfig, SkinRender } from "./types.ts";

const MINIMAL_SKIN_PATH = fileURLToPath(new URL("../../../skins/minimal.json", import.meta.url));
const CUSTOM_SKINS_DIRECTORY = ".lori/skins";
const SKIN_ID_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?$/;
const CORE_EVENTS: CoreEvent[] = [
  "status.idle",
  "session.open",
  "session.startRejected",
  "session.paused",
  "session.pauseRejected",
  "session.resumed",
  "session.resumeRejected",
  "session.restored",
  "session.closed",
  "session.closeRejected",
];

export type SkinProvider = { render: SkinRender };
type Templates = Partial<Record<CoreEvent, string>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProjectPath(projectRoot: string, filePath: string): boolean {
  const pathFromProjectRoot = relative(projectRoot, filePath);
  return (
    pathFromProjectRoot !== "" &&
    pathFromProjectRoot !== ".." &&
    !pathFromProjectRoot.startsWith(`..${sep}`) &&
    !isAbsolute(pathFromProjectRoot)
  );
}

async function readSkin(path: string): Promise<unknown> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as unknown;
  } catch {
    return undefined;
  }
}

function validPlaceholders(event: CoreEvent, template: string): boolean {
  const parameterNames = new Set(Object.keys(eventParameterDefaults[event]));
  const placeholderMatches = template.match(/\{[^{}]*\}/g) ?? [];
  if (placeholderMatches.some((placeholder) => !parameterNames.has(placeholder.slice(1, -1)))) {
    return false;
  }
  return !/[{}]/.test(template.replace(/\{[^{}]*\}/g, ""));
}

const eventParameterDefaults: { [Event in CoreEvent]: CoreEventParameters[Event] } = {
  "status.idle": { totalXp: 0 },
  "session.open": { domain: "", technique: "", elapsed: "" },
  "session.startRejected": { domain: "", technique: "" },
  "session.paused": { domain: "", technique: "", elapsed: "" },
  "session.pauseRejected": { domain: "", technique: "" },
  "session.resumed": { domain: "", technique: "", elapsed: "" },
  "session.resumeRejected": { domain: "", technique: "" },
  "session.restored": { domain: "", technique: "", elapsed: "" },
  "session.closed": { domain: "", technique: "", elapsed: "", focus: 0, honesty: 0 },
  "session.closeRejected": { domain: "", technique: "" },
};

function validateTemplates(data: unknown, expectedId: string): Templates {
  if (!isRecord(data) || data.id !== expectedId || !isRecord(data.templates)) {
    return {};
  }
  const templates: Templates = {};
  for (const event of CORE_EVENTS) {
    const template = data.templates[event];
    if (typeof template === "string" && template.length > 0 && validPlaceholders(event, template)) {
      templates[event] = template;
    }
  }
  return templates;
}

function interpolate(template: string, parameters: Record<string, string | number>): string {
  return template.replace(/\{([^{}]+)\}/g, (placeholder, name: string) => {
    if (!Object.hasOwn(parameters, name)) {
      return placeholder;
    }
    return String(parameters[name]);
  });
}

export async function createSkinProvider(projectDir: string, skinConfig: SkinConfig): Promise<SkinProvider> {
  const minimalData = await readSkin(MINIMAL_SKIN_PATH);
  const minimalTemplates = validateTemplates(minimalData, "minimal");
  const configuredId = skinConfig.skin;
  let customTemplates: Templates = {};

  if (configuredId !== "minimal" && SKIN_ID_PATTERN.test(configuredId)) {
    try {
      const projectRoot = await realpath(projectDir);
      const customSkinPath = resolve(projectRoot, CUSTOM_SKINS_DIRECTORY, `${configuredId}.json`);
      const resolvedSkinPath = await realpath(customSkinPath);
      if (isProjectPath(projectRoot, resolvedSkinPath)) {
        customTemplates = validateTemplates(await readSkin(resolvedSkinPath), configuredId);
      }
    } catch {
      // Missing, unreadable, or out-of-project custom skins use Minimal per event.
    }
  }

  return {
    render<Event extends CoreEvent>(event: Event, parameters: CoreEventParameters[Event]): string {
      const template = customTemplates[event] ?? minimalTemplates[event];
      return interpolate(template ?? "", parameters as Record<string, string | number>);
    },
  };
}
