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

export async function listResources(input: ListResourcesInput): Promise<string> {
  const config = loadConfig();
  const uri = input.uri || "viking://resources/";
  
  try {
    // Use the existing membrowse pattern
    const response = await makeRequest<OpenVikingResponse<any>>(config, {
      method: "GET",
      endpoint: `/api/v1/browse?uri=${encodeURIComponent(uri)}`,
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
    const response = await makeRequest<OpenVikingResponse<any>>(config, {
      method: "GET",
      endpoint: `/api/v1/stat?uri=${encodeURIComponent(input.uri)}`,
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