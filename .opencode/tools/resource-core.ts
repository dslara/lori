/**
 * Resource Management Tool - Add and manage OpenViking resources
 *
 * Uses the existing openviking-client for API calls.
 */

import { makeRequest, loadConfig, OpenVikingResponse } from "../shared/openviking-client.js";

interface AddResourceInput {
  path: string;
  target?: string;
  to?: string;
  wait?: boolean;
  reason?: string;
}

interface ListResourcesInput {
  uri?: string;
}

interface GetResourceInput {
  uri: string;
}

interface MoveResourceInput {
  from: string;
  to: string;
}

interface DeleteResourceInput {
  uri: string;
  recursive?: boolean;
}

interface LinkResourcesInput {
  from: string;
  to: string | string[];
  reason?: string;
}

interface GetRelationsInput {
  uri: string;
}

interface ReadContentInput {
  uri: string;
  level: "abstract" | "overview" | "read";
}

interface ExportPackInput {
  uri: string;
  to: string;
}

interface ImportPackInput {
  file_path: string;
  parent: string;
  force?: boolean;
  vectorize?: boolean;
}

interface ResourceData {
  status?: string;
  source_path?: string;
  root_uri?: string;
  temp_uri?: string;
  meta?: {
    file_count?: number;
    repo_name?: string;
  };
  errors?: string[];
}

export async function addResource(input: AddResourceInput): Promise<string> {
  const config = loadConfig();
  
  try {
    const response = await makeRequest<OpenVikingResponse<ResourceData>>(config, {
      method: "POST",
      endpoint: "/api/v1/resources",
      body: { path: input.path, target: input.target },
    });

    if (response.status === "error") {
      return JSON.stringify({
        success: false,
        error: response.error,
        message: typeof response.error === "string" 
          ? response.error 
          : response.error?.message || "Unknown error"
      });
    }

    const result = response.result;
    
    if (input.wait && result?.temp_uri) {
      // TODO: Implement wait for processing completion
      // For now, just return success
    }

    return JSON.stringify({
      success: true,
      data: {
        source: result?.source_path || input.path,
        root_uri: result?.root_uri,
        temp_uri: result?.temp_uri,
        file_count: result?.meta?.file_count,
        repo_name: result?.meta?.repo_name,
        errors: result?.errors || [],
        message: result?.errors?.length === 0 
          ? "Resource added successfully" 
          : `Resource added with ${result?.errors?.length} errors`
      }
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: "REQUEST_FAILED",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

// CORREÇÕES FEITAS EM 2026-04-11:
// - listResources: `/api/v1/browse` → `/api/v1/fs/ls`
// - getResourceInfo: `/api/v1/stat` → `/api/v1/fs/stat`
// Estas correções precisam de /reload para ter efeito

export async function listResources(input: ListResourcesInput): Promise<string> {
  const config = loadConfig();
  const uri = input.uri || "viking://resources/";
  
  try {
    const encodedUri = encodeURIComponent(uri);
    const response = await makeRequest<OpenVikingResponse<any[]>>(config, {
      method: "GET",
      endpoint: `/api/v1/fs/ls?uri=${encodedUri}&recursive=false&simple=false`,
    });

    if (response.status === "error") {
      return JSON.stringify({
        success: false,
        error: response.error,
        message: typeof response.error === "string" 
          ? response.error 
          : response.error?.message || "Unknown error"
      });
    }

    return JSON.stringify({
      success: true,
      data: response.result
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: "REQUEST_FAILED",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function getResourceInfo(input: GetResourceInput): Promise<string> {
  const config = loadConfig();
  
  try {
    const encodedUri = encodeURIComponent(input.uri);
    const response = await makeRequest<OpenVikingResponse<Record<string, unknown>>>(config, {
      method: "GET",
      endpoint: `/api/v1/fs/stat?uri=${encodedUri}`,
    });

    if (response.status === "error") {
      return JSON.stringify({
        success: false,
        error: response.error,
        message: typeof response.error === "string" 
          ? response.error 
          : response.error?.message || "Unknown error"
      });
    }

    return JSON.stringify({
      success: true,
      data: response.result
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: "REQUEST_FAILED",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function moveResource(input: MoveResourceInput): Promise<string> {
  const config = loadConfig();
  
  try {
    const response = await makeRequest<OpenVikingResponse<{ from: string; to: string }>>(config, {
      method: "POST",
      endpoint: "/api/v1/fs/mv",
      body: { from_uri: input.from, to_uri: input.to },
    });

    if (response.status === "error") {
      return JSON.stringify({
        success: false,
        error: response.error,
        message: typeof response.error === "string" 
          ? response.error 
          : response.error?.message || "Unknown error"
      });
    }

    return JSON.stringify({
      success: true,
      data: response.result
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: "REQUEST_FAILED",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function deleteResource(input: DeleteResourceInput): Promise<string> {
  const config = loadConfig();
  
  try {
    const encodedUri = encodeURIComponent(input.uri);
    const recursive = input.recursive ? "true" : "false";
    const response = await makeRequest<OpenVikingResponse<{ uri: string }>>(config, {
      method: "DELETE",
      endpoint: `/api/v1/fs?uri=${encodedUri}&recursive=${recursive}`,
    });

    if (response.status === "error") {
      return JSON.stringify({
        success: false,
        error: response.error,
        message: typeof response.error === "string" 
          ? response.error 
          : response.error?.message || "Unknown error"
      });
    }

    return JSON.stringify({
      success: true,
      data: response.result
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: "REQUEST_FAILED",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function linkResources(input: LinkResourcesInput): Promise<string> {
  const config = loadConfig();
  
  try {
    const response = await makeRequest<OpenVikingResponse<{ from: string; to: string[] }>>(config, {
      method: "POST",
      endpoint: "/api/v1/relations/link",
      body: { 
        from_uri: input.from, 
        to_uris: input.to,
        reason: input.reason
      },
    });

    if (response.status === "error") {
      return JSON.stringify({
        success: false,
        error: response.error,
        message: typeof response.error === "string" 
          ? response.error 
          : response.error?.message || "Unknown error"
      });
    }

    return JSON.stringify({
      success: true,
      data: response.result
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: "REQUEST_FAILED",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function unlinkResources(from: string, to: string): Promise<string> {
  const config = loadConfig();
  
  try {
    const response = await makeRequest<OpenVikingResponse<{ from: string; to: string }>>(config, {
      method: "DELETE",
      endpoint: "/api/v1/relations/link",
      body: { from_uri: from, to_uri: to },
    });

    if (response.status === "error") {
      return JSON.stringify({
        success: false,
        error: response.error,
        message: typeof response.error === "string" 
          ? response.error 
          : response.error?.message || "Unknown error"
      });
    }

    return JSON.stringify({
      success: true,
      data: response.result
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: "REQUEST_FAILED",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function getRelations(input: GetRelationsInput): Promise<string> {
  const config = loadConfig();
  
  try {
    const encodedUri = encodeURIComponent(input.uri);
    const response = await makeRequest<OpenVikingResponse<any[]>>(config, {
      method: "GET",
      endpoint: `/api/v1/relations?uri=${encodedUri}`,
    });

    if (response.status === "error") {
      return JSON.stringify({
        success: false,
        error: response.error,
        message: typeof response.error === "string" 
          ? response.error 
          : response.error?.message || "Unknown error"
      });
    }

    return JSON.stringify({
      success: true,
      data: response.result
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: "REQUEST_FAILED",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function readContent(input: ReadContentInput): Promise<string> {
  const config = loadConfig();
  
  try {
    const encodedUri = encodeURIComponent(input.uri);
    const endpoint = `/api/v1/content/${input.level}?uri=${encodedUri}`;
    const response = await makeRequest<OpenVikingResponse<string>>(config, {
      method: "GET",
      endpoint,
    });

    if (response.status === "error") {
      return JSON.stringify({
        success: false,
        error: response.error,
        message: typeof response.error === "string" 
          ? response.error 
          : response.error?.message || "Unknown error"
      });
    }

    return JSON.stringify({
      success: true,
      data: {
        uri: input.uri,
        level: input.level,
        content: response.result
      }
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: "REQUEST_FAILED",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function exportPack(input: ExportPackInput): Promise<string> {
  const config = loadConfig();
  
  try {
    const response = await makeRequest<OpenVikingResponse<{ file: string }>>(config, {
      method: "POST",
      endpoint: "/api/v1/pack/export",
      body: { uri: input.uri, to: input.to },
    });

    if (response.status === "error") {
      return JSON.stringify({
        success: false,
        error: response.error,
        message: typeof response.error === "string" 
          ? response.error 
          : response.error?.message || "Unknown error"
      });
    }

    return JSON.stringify({
      success: true,
      data: response.result
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: "REQUEST_FAILED",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function importPack(input: ImportPackInput): Promise<string> {
  const config = loadConfig();
  
  try {
    const response = await makeRequest<OpenVikingResponse<{ uri: string }>>(config, {
      method: "POST",
      endpoint: "/api/v1/pack/import",
      body: { 
        file_path: input.file_path, 
        parent: input.parent,
        force: input.force ?? false,
        vectorize: input.vectorize ?? true
      },
    });

    if (response.status === "error") {
      return JSON.stringify({
        success: false,
        error: response.error,
        message: typeof response.error === "string" 
          ? response.error 
          : response.error?.message || "Unknown error"
      });
    }

    return JSON.stringify({
      success: true,
      data: response.result
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: "REQUEST_FAILED",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}