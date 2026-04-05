export interface DeleteCategoryUseCaseParams {
  id: string;
}

export interface DeleteCategoryUseCaseInterface {
  execute(params: DeleteCategoryUseCaseParams): Promise<void>;
}
