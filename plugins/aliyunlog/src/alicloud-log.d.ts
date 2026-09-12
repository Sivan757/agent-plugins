// Type declarations for @alicloud/log (no official @types package available)
declare module '@alicloud/log' {
  interface ALYOptions {
    accessKeyId: string;
    accessKeySecret: string;
    endpoint: string;
  }

  interface LogStoreResult {
    logstores?: string[];
    count?: number;
  }

  interface ProjectResult {
    projects?: unknown[];
    count?: number;
  }

  class ALY {
    constructor(options: ALYOptions);
    listLogStore(project: string): Promise<LogStoreResult>;
    listProject(): Promise<ProjectResult>;
    getLogs(
      project: string,
      logstore: string,
      from: Date,
      to: Date,
      options: { query: string; line: number; offset: number; reverse?: boolean }
    ): Promise<Array<Record<string, string | number>>>;
  }

  export = ALY;
}
