export interface RemoveWorkLocationUseCaseParams {
  providerId: string;
  locationId: string;
}

export interface RemoveWorkLocationUseCaseInterface {
  execute(params: RemoveWorkLocationUseCaseParams): Promise<void>;
}
