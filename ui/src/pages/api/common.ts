export class RequestMethodError extends Error {
  methods: string[];

  constructor(
    message: string | undefined,
    options: ErrorOptions | undefined,
    methods: string[],
  ) {
    super(message, options);

    this.methods = methods;
  }
}

export type FetchOptions = {
  info: RequestInfo;
  init: RequestInit | undefined;
};

export type BackingApiConfig = {
  urlRoot: string;
};
