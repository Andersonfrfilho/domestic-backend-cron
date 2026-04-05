export interface GetDocumentUrlUseCaseParams {
  id: string;
}

export interface GetDocumentUrlUseCaseResponse {
  url: string;
  expiresIn: number;
}

export interface GetDocumentUrlUseCaseInterface {
  execute(params: GetDocumentUrlUseCaseParams): Promise<GetDocumentUrlUseCaseResponse>;
}
