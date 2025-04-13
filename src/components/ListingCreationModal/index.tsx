import React, { useState } from 'react';
import { useUserStore } from '../../stores/userStore';
import { 
  useListingStore, 
  ListingType, 
  ItemCategory, 
  ServiceCategory, 
  ItemCondition,
  ListingFormData
} from '../../stores/listingStore';

// Props interface for the modal component
interface ListingCreationModalProps {
  onClose: () => void;
}

export const ListingCreationModal: React.FC<ListingCreationModalProps> = ({ onClose }) => {
  // Get current user
  const { getCurrentUser } = useUserStore();
  // Get listing store methods
  const { createListing, isLoading, error: storeError } = useListingStore();
  
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return null;
  }

  // Initialize form state
  const [formData, setFormData] = useState<ListingFormData>({
    listingType: ListingType.SELL,
    category: ItemCategory.VIDEO_GAME,
    title: '',
    shortDescription: '',
    detailedDescription: '',
    price: '',
    condition: ItemCondition.NEW,
    location: '',
    isRemote: false,
    contactInfo: '',
    tags: ''
  });
  
  // Step-based form navigation
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // Validation state
  const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({});
  
  // Image upload state (simplified for demo)
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isValidImage, setIsValidImage] = useState(true);

  // Handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field if any
    if (errors[name as keyof ListingFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...newFiles]);
      
      // Generate preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };
  
  // Remove an uploaded image
  const handleRemoveImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newUrls = [...previewUrls];
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newUrls[index]);
    
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setImageFiles(newFiles);
    setPreviewUrls(newUrls);
  };
  
  // Handle image URL change
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setIsValidImage(true); // Reset validation on change
  };
  
  // Handle image load error
  const handleImageError = () => {
    setIsValidImage(false);
  };

  // Navigate to the next step
  const handleNextStep = () => {
    // Validate current step
    const validationErrors = validateStep(currentStep);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  // Navigate to the previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Validate the current step
  const validateStep = (step: number): Partial<Record<keyof ListingFormData, string>> => {
    const stepErrors: Partial<Record<keyof ListingFormData, string>> = {};
    
    switch (step) {
      case 1: // Listing type & category
        if (!formData.listingType) {
          stepErrors.listingType = 'Please select a listing type';
        }
        if (!formData.category) {
          stepErrors.category = 'Please select a category';
        }
        break;
      case 2: // Title and descriptions
        if (!formData.title.trim()) {
          stepErrors.title = 'Please enter a title';
        }
        if (!formData.shortDescription.trim()) {
          stepErrors.shortDescription = 'Please enter a short description';
        }
        break;
      case 3: // Pricing and condition
        if (!formData.price.trim()) {
          stepErrors.price = 'Please enter a price or rate';
        }
        if (isPhysicalItem() && !formData.condition) {
          stepErrors.condition = 'Please select a condition';
        }
        break;
      case 4: // Location and contact
        if (!formData.location.trim() && !formData.isRemote) {
          stepErrors.location = 'Please enter a location or select remote';
        }
        if (!formData.contactInfo.trim()) {
          stepErrors.contactInfo = 'Please enter contact information';
        }
        break;
    }
    
    return stepErrors;
  };
  
  // Check if the listing is for a physical item
  const isPhysicalItem = () => {
    return [ListingType.SELL, ListingType.BUY, ListingType.TRADE].includes(formData.listingType);
  };
  
  // Check if the listing is for a service
  const isService = () => {
    return [ListingType.OFFER_SERVICE, ListingType.REQUEST_SERVICE].includes(formData.listingType);
  };
  
  // Prevent form submission on Enter key unless on the final step
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // If Enter is pressed and not inside a textarea, and not on final step
    if (e.key === 'Enter' && 
        e.target instanceof HTMLElement && 
        e.target.tagName.toLowerCase() !== 'textarea' && 
        currentStep < totalSteps) {
      e.preventDefault();
      // Optionally advance to next step if inputs are valid
      handleNextStep();
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only allow submission if on the final step
    if (currentStep < totalSteps) {
      e.stopPropagation();
      handleNextStep();
      return;
    }
    
    // Validate the entire form
    let formErrors: Partial<Record<keyof ListingFormData, string>> = {};
    for (let step = 1; step <= totalSteps; step++) {
      const stepErrors = validateStep(step);
      formErrors = { ...formErrors, ...stepErrors };
    }
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      // Find the earliest step with an error and navigate to it
      for (let step = 1; step <= totalSteps; step++) {
        const stepFields = getFieldsForStep(step);
        const hasErrorInStep = stepFields.some(field => formErrors[field as keyof ListingFormData]);
        if (hasErrorInStep) {
          setCurrentStep(step);
          break;
        }
      }
      return;
    }
    
    // Convert the image URL to a File object
    let imageFiles: File[] = [];
    if (imageUrl.trim()) {
      // Create a mock File object
      const fileName = imageUrl.split('/').pop() || 'image.jpg';
      // Use a blob to simulate a file - in a real app you might handle this differently
      const mockFile = new File([new Blob()], fileName, { type: 'image/jpeg' });
      
      // Override the createMockImageUrl function behavior for this specific file
      // by adding a special attribute to the file
      Object.defineProperty(mockFile, 'customUrl', {
        value: imageUrl,
        writable: false
      });
      
      imageFiles = [mockFile];
    }
    
    // Form is valid, submit to store
    try {
      await createListing(formData, imageFiles);
      
      alert('Listing created successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting listing:', error);
      setErrors({ ...errors, general: storeError || 'Failed to create listing. Please try again.' });
    }
  };
  
  // Get the fields that belong to a specific step
  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 1: return ['listingType', 'category'];
      case 2: return ['title', 'shortDescription', 'detailedDescription'];
      case 3: return ['price', 'condition'];
      case 4: return ['location', 'isRemote', 'contactInfo'];
      case 5: return ['tags'];
      default: return [];
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Create Listing</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-2">
          <div 
            className="bg-blue-600 h-2 transition-all duration-300 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        {/* Display store error if any */}
        {storeError && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{storeError}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="p-6">
          {/* Step 1: Listing Type & Category */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What would you like to do?
                </label>
                <select
                  name="listingType"
                  value={formData.listingType}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.listingType ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value={ListingType.SELL}>Sell an Item</option>
                  <option value={ListingType.BUY}>Buy an Item</option>
                  <option value={ListingType.TRADE}>Trade an Item</option>
                  <option value={ListingType.OFFER_SERVICE}>Offer a Service</option>
                  <option value={ListingType.REQUEST_SERVICE}>Request a Service</option>
                </select>
                {errors.listingType && <p className="text-red-500 text-sm mt-1">{errors.listingType}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What kind of {isService() ? 'service' : 'game-related item'} is this for?
                </label>
                {isService() ? (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value={ServiceCategory.COACHING}>Coaching</option>
                    <option value={ServiceCategory.GAME_MASTER}>Game Master</option>
                    <option value={ServiceCategory.MEDIATION}>Mediation</option>
                    <option value={ServiceCategory.OTHER}>Other Service</option>
                  </select>
                ) : (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value={ItemCategory.VIDEO_GAME}>Video Game</option>
                    <option value={ItemCategory.BOARD_GAME}>Board Game</option>
                    <option value={ItemCategory.CONSOLE}>Console/Hardware</option>
                    <option value={ItemCategory.ACCESSORY}>Accessory</option>
                    <option value={ItemCategory.COLLECTIBLE}>Collectible/Merchandise</option>
                    <option value={ItemCategory.OTHER}>Other</option>
                  </select>
                )}
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
            </div>
          )}
          
          {/* Step 2: Title and Descriptions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter a title for your listing
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g. Settlers of Catan - Great Condition!"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provide a brief description
                </label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full p-2 border rounded ${errors.shortDescription ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="A short summary of your listing (max 150 characters)"
                  maxLength={150}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.shortDescription.length}/150 characters</p>
                {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter a detailed description
                </label>
                <textarea
                  name="detailedDescription"
                  value={formData.detailedDescription}
                  onChange={handleChange}
                  rows={6}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Provide all the details about your item or service"
                />
              </div>
            </div>
          )}
          
          {/* Step 3: Pricing and Condition */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isService() 
                    ? 'What is your rate for this service?' 
                    : formData.listingType === ListingType.SELL 
                      ? 'What is your asking price?' 
                      : formData.listingType === ListingType.BUY 
                        ? 'What is your budget?' 
                        : 'What is the value of your item?'
                  }
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`w-full pl-7 p-2 border rounded ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="0.00"
                    aria-describedby="price-currency"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm" id="price-currency">USD</span>
                  </div>
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                
                {isService() && (
                  <p className="mt-2 text-sm text-gray-500">
                    Tip: You can specify if this is an hourly rate, fixed price, or negotiable in your description.
                  </p>
                )}
              </div>
              
              {isPhysicalItem() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What is the condition of the item?
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${errors.condition ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value={ItemCondition.NEW}>New</option>
                    <option value={ItemCondition.LIKE_NEW}>Like New</option>
                    <option value={ItemCondition.GOOD}>Used - Good</option>
                    <option value={ItemCondition.FAIR}>Used - Fair</option>
                    <option value={ItemCondition.FOR_PARTS}>For Parts Only</option>
                  </select>
                  {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
                </div>
              )}
            </div>
          )}
          
          {/* Step 4: Location and Contact */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Where is this {isService() ? 'service' : 'item'} available?
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded mb-2 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="City, State/Province"
                  disabled={formData.isRemote}
                />
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isRemote"
                    checked={formData.isRemote}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    This is {isService() ? 'a remote service' : 'available for shipping'} (no specific location)
                  </span>
                </label>
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How should interested parties contact you?
                </label>
                <textarea
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  rows={2}
                  className={`w-full p-2 border rounded ${errors.contactInfo ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Email, phone, Discord handle, etc."
                />
                <p className="text-sm text-gray-500 mt-1">This information will be visible to other users.</p>
                {errors.contactInfo && <p className="text-red-500 text-sm mt-1">{errors.contactInfo}</p>}
              </div>
            </div>
          )}
          
          {/* Step 5: Photos and Tags */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload photos or media (optional but recommended)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload files</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          multiple 
                          className="sr-only" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                
                {/* Image previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={url} 
                          alt={`Preview ${index + 1}`} 
                          className="h-24 w-full object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                          aria-label="Remove image"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add any keywords or tags (optional)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g. strategy, nintendo, rpg (comma separated)"
                />
                <p className="text-sm text-gray-500 mt-1">Separate tags with commas. Tags help users find your listing.</p>
              </div>
              
              {/* Image URL Input */}
              <div className="mb-4">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {imageUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Preview:</p>
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full max-h-48 object-contain border rounded" 
                      onError={handleImageError}
                    />
                    {!isValidImage && (
                      <p className="text-sm text-red-500 mt-1">
                        Unable to load image. Please check the URL and try again.
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Final review */}
              <div className="bg-gray-50 p-4 rounded-lg mt-6">
                <h3 className="text-md font-medium text-gray-900">Review your listing</h3>
                <div className="mt-2 space-y-2 text-sm text-gray-700">
                  <p><strong>Type:</strong> {formData.listingType.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Category:</strong> {formData.category.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Price:</strong> ${formData.price}</p>
                  {isPhysicalItem() && <p><strong>Condition:</strong> {formData.condition?.replace('_', ' ').toUpperCase()}</p>}
                  <p><strong>Location:</strong> {formData.isRemote ? 'Remote/Online' : formData.location}</p>
                </div>
              </div>
              
              {/* General error message if submission fails */}
              {errors.general && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4">
                  <p>{errors.general}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={isLoading}
              >
                Back
              </button>
            ) : (
              <div></div> // Empty div to maintain spacing
            )}
            
            {currentStep < totalSteps ? (
              <button
                type="button" // Ensure this is explicitly button type
                onClick={handleNextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isLoading}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Listing'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
