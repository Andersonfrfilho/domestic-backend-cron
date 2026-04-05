export interface DeleteUserUseCaseParams {
  id: string;
}

export interface DeleteUserUseCaseInterface {
  execute(params: DeleteUserUseCaseParams): Promise<void>;
}
