import { PropertyState, initialPropertyState } from "./propertyState";
import { PropertyEvent } from "./propertyEvent";
import { PropertyService } from "../services/propertyService";
import { FileUploadService } from "../services/fileUploadService";

type StateListener = (state: PropertyState) => void;

export class PropertyBloc {
  private _state: PropertyState = initialPropertyState;
  private _listeners: StateListener[] = [];
  private propertyService = new PropertyService();
  private fileUploadService = new FileUploadService();
  private user: any = null;

  setUser(user: any) {
    this.user = user;
  }

  get currentState() {
    return this._state;
  }

  subscribe(listener: StateListener) {
    this._listeners.push(listener);
    listener(this._state); // Emit current state immediately

    // Return unsubscribe function
    return () => {
      this._listeners = this._listeners.filter((l) => l !== listener);
    };
  }

  async add(event: PropertyEvent) {
    switch (event.type) {
      case "SUBMIT_PROPERTY":
        await this._handleSubmitProperty(event);
        break;
      case "UPDATE_PROPERTY":
        await this._handleUpdateProperty(event);
        break;
      case "LOAD_PROPERTIES":
        await this._handleLoadProperties(event);
        break;
      case "DELETE_PROPERTY":
        await this._handleDeleteProperty(event);
        break;
      case "RESET_FORM":
        this._handleResetForm();
        break;
      default:
        break;
    }
  }

  private async _handleSubmitProperty(event: any) {
    this._emit({ ...this.currentState, isLoading: true, error: null });

    try {
      console.log('Video payload:', event.payload.video);
      console.log('Video exists:', !!event.payload.video);
      
      // Upload files first
      const imageUrls = event.payload.images
        ? await this.fileUploadService.uploadImages(event.payload.images)
        : [];

      const videoUrl = event.payload.video && event.payload.video.length > 0
        ? await this.fileUploadService.uploadVideo(event.payload.video[0])
        : "";

      console.log('Video URL after upload:', videoUrl);

      // Prepare property data
      const propertyData = {
        ...event.payload.formData,
        imageUrl: imageUrls[0] || "",
        imageUrls,
        videoUrl,
        propertyType: event.payload.propertyType,
        transactionType: event.payload.transactionType,
      };

      // Submit to service
      const result = await this.propertyService.addProperty(propertyData, this.user);

      this._emit({
        ...this.currentState,
        isLoading: false,
        success: true,
        message: "Property added successfully",
        properties: [...this.currentState.properties, result],
      });
    } catch (error: any) {
      this._emit({
        ...this.currentState,
        isLoading: false,
        error: error.message || "Failed to add property",
      });
    }
  }

  private async _handleUpdateProperty(event: any) {
    this._emit({ ...this.currentState, isLoading: true, error: null });

    try {
      const result = await this.propertyService.updateProperty(
        event.payload.propertyId,
        event.payload.formData,
        this.user,
      );

      const updatedProperties = this.currentState.properties.map((p) =>
        p.id === event.payload.propertyId ? result : p,
      );

      this._emit({
        ...this.currentState,
        isLoading: false,
        success: true,
        message: "Property updated successfully",
        properties: updatedProperties,
      });
    } catch (error: any) {
      this._emit({
        ...this.currentState,
        isLoading: false,
        error: error.message || "Failed to update property",
      });
    }
  }

  private async _handleLoadProperties(event: any) {
    this._emit({ ...this.currentState, isLoading: true, error: null });

    try {
      const properties = await this.propertyService.getProperties(
        event.payload?.filters,
      );

      this._emit({
        ...this.currentState,
        isLoading: false,
        properties,
        success: true,
      });
    } catch (error: any) {
      this._emit({
        ...this.currentState,
        isLoading: false,
        error: error.message || "Failed to load properties",
      });
    }
  }

  private async _handleDeleteProperty(event: any) {
    this._emit({ ...this.currentState, isLoading: true, error: null });

    try {
      await this.propertyService.deleteProperty(event.payload.propertyId);

      const filteredProperties = this.currentState.properties.filter(
        (p) => p.id !== event.payload.propertyId,
      );

      this._emit({
        ...this.currentState,
        isLoading: false,
        success: true,
        message: "Property deleted successfully",
        properties: filteredProperties,
      });
    } catch (error: any) {
      this._emit({
        ...this.currentState,
        isLoading: false,
        error: error.message || "Failed to delete property",
      });
    }
  }

  private _handleResetForm() {
    this._emit({
      ...this.currentState,
      isLoading: false,
      error: null,
      success: false,
      message: null,
    });
  }

  private _emit(state: PropertyState) {
    this._state = state;
    this._listeners.forEach((listener) => listener(state));
  }

  dispose() {
    this._listeners = [];
  }
}
