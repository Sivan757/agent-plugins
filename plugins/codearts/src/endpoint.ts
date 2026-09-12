//
// endpoint.ts — locate the per-service API hosts of a CodeArts deployment.
//
// Public Huawei Cloud derives every CodeArts host from the region
// (`cloudbuild-ext.<region>.myhuaweicloud.com`). Private deployments
// (Huawei Cloud Stack) do not: the documentation tells you to ask an
// administrator, and the real hosts mix naming families — one deployment in
// the wild serves Pipeline from `cloudpipeline-ext.<region>.<domain>` while
// Build answers on `cloudbuild.<region>.<domain>`.
//
// So instead of guessing, this module probes the plausible names and reports
// which one actually serves each service. A host that serves an API answers
// APIGW.0301 / 401 / 403 without credentials; a host that does not answers
// APIGW.0101 ("API does not exist or has not been published").

import { probeEndpoint } from "./http.js";

export interface ServiceProbe {
  service: string;
  label: string;
  /** Subdomain candidates, most likely first. */
  subdomains: string[];
  method: string;
  /** Documented path used to recognise a live host; `{project_id}` is filled in. */
  path: string;
}

/**
 * Probe definitions. The paths are the cheapest documented endpoint per
 * service that any deployment with the service enabled will publish.
 */
export const SERVICE_PROBES: ServiceProbe[] = [
  {
    service: "codeartspipeline",
    label: "pipeline",
    subdomains: ["cloudpipeline-ext", "cloudpipeline", "codeartspipeline", "pipeline"],
    method: "POST",
    path: "/v5/{project_id}/api/pipelines/list",
  },
  {
    service: "codeartsbuild",
    label: "build",
    subdomains: ["cloudbuild", "cloudbuild-ext", "codeartsbuild", "codeci", "build"],
    method: "GET",
    path: "/v1/job/list",
  },
  {
    service: "codeartscheck",
    label: "check",
    subdomains: ["codeartscheck", "codecheck", "codecheck-ext", "check"],
    method: "GET",
    path: "/v2/{project_id}/tasks",
  },
  {
    service: "codeartsrepo",
    label: "repo",
    subdomains: ["codeartsrepo", "codehub", "codehub-ext", "repo"],
    method: "GET",
    path: "/v1/projects/{project_id}/repositories",
  },
  {
    service: "codeartsdeploy",
    label: "deploy",
    subdomains: ["codeartsdeploy", "deployman", "deployman-ext", "deploy"],
    method: "POST",
    path: "/v1/applications/list",
  },
  {
    service: "codeartsartifact",
    label: "artifact",
    subdomains: ["codeartsartifact", "cloudartifact", "artifact", "devrepo"],
    method: "GET",
    path: "/v2/{project_id}/release/files",
  },
  {
    service: "codeartswiki",
    label: "wiki",
    subdomains: ["codeartswiki", "cloudwiki", "wiki", "zhishiku"],
    method: "GET",
    path: "/v1/openapi/project/zhishiku/{project_id}",
  },
  {
    service: "codeartsboard",
    label: "board",
    subdomains: ["codeartsboard", "cloudboard", "board", "bi"],
    method: "POST",
    path: "/v1/{project_id}/access-data-api/probe",
  },
];

export interface DiscoveryResult {
  service: string;
  label: string;
  /** Endpoint that answered, when one did. */
  endpoint?: string;
  /** Candidates that were tried, in order. */
  tried: string[];
  detail: string;
}

/** Build the candidate origins for one service in a region and domain. */
export function endpointCandidates(probe: ServiceProbe, region: string, domain: string): string[] {
  const bare = domain.replace(/^\.+/, "");
  return probe.subdomains.map((sub) => `https://${sub}.${region}.${bare}`);
}

/**
 * Probe every candidate for one service and return the first live endpoint.
 * `region` and `domain` come from configuration, e.g. `cn-south-303` and
 * `ai-huadu.com`.
 */
export async function discoverServiceEndpoint(
  probe: ServiceProbe,
  options: { region: string; domain: string; projectId: string; timeoutMs?: number }
): Promise<DiscoveryResult> {
  const candidates = endpointCandidates(probe, options.region, options.domain);
  const path = probe.path.replace("{project_id}", options.projectId);
  const tried: string[] = [];

  for (const candidate of candidates) {
    tried.push(candidate);
    const result = await probeEndpoint(candidate, options.timeoutMs ?? 6_000, {
      method: probe.method,
      path,
    });
    if (result.looksLikeCodearts) {
      return {
        service: probe.service,
        label: probe.label,
        endpoint: candidate,
        tried,
        detail: result.detail,
      };
    }
  }

  const last = tried[tried.length - 1];
  return {
    service: probe.service,
    label: probe.label,
    tried,
    detail:
      `none of ${tried.length} candidate hosts serve this service (last tried ${last}). ` +
      `The service may be disabled in this deployment, or it may use a host name outside the known set — ` +
      `check the CodeArts console's network requests, or ask the administrator for the endpoint.`,
  };
}

/** Run discovery for every service, or a subset. */
export async function discoverEndpoints(options: {
  region: string;
  domain: string;
  projectId: string;
  services?: string[];
  timeoutMs?: number;
}): Promise<DiscoveryResult[]> {
  const probes = options.services?.length
    ? SERVICE_PROBES.filter((probe) =>
        options.services!.some(
          (name) => probe.service === name || probe.label === name.toLowerCase()
        )
      )
    : SERVICE_PROBES;

  const results: DiscoveryResult[] = [];
  for (const probe of probes) {
    results.push(await discoverServiceEndpoint(probe, options));
  }
  return results;
}
