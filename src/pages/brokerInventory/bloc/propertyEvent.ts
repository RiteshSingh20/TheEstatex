export interface SubmitPropertyEvent {
  type: 'SUBMIT_PROPERTY';
  payload: {
    formData: any;
    images?: FileList;
    video?: File;
    propertyType: 'Residential' | 'Commercial' | 'Plot';
    transactionType: 'Resale' | 'Rental' | 'Sale';
  };
}

export interface UpdatePropertyEvent {
  type: 'UPDATE_PROPERTY';
  payload: {
    propertyId: string;
    formData: any;
    images?: FileList;
    video?: File;
  };
}

export interface LoadPropertiesEvent {
  type: 'LOAD_PROPERTIES';
  payload?: {
    filters?: {
      propertyType?: string;
      transactionType?: string;
      status?: string;
      userId?: string;
    };
  };
}

export interface DeletePropertyEvent {
  type: 'DELETE_PROPERTY';
  payload: {
    propertyId: string;
  };
}

export interface ResetFormEvent {
  type: 'RESET_FORM';
}

export interface SetCurrentPropertyEvent {
  type: 'SET_CURRENT_PROPERTY';
  payload: {
    property: any;
  };
}

export interface ClearErrorEvent {
  type: 'CLEAR_ERROR';
}

export type PropertyEvent = 
  | SubmitPropertyEvent
  | UpdatePropertyEvent
  | LoadPropertiesEvent
  | DeletePropertyEvent
  | ResetFormEvent
  | SetCurrentPropertyEvent
  | ClearErrorEvent;