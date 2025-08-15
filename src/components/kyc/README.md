# Modern E-KYC User Flow

This directory contains the implementation of a modern, user-friendly E-KYC (Electronic Know Your Customer) flow with the following features:

## 🎯 Features

### 1. Welcome & Onboarding Screen
- Full-screen, minimal UI with soft gradients
- Clear call-to-action button
- Progress indicator (0% complete)
- Step-by-step explanation

### 2. ID Type Selection
- Card-style selection with large icons
- Smooth hover/tap animations
- Animated transitions between steps

### 3. ID Scanning (Front & Back)
- Camera preview with rounded frame overlay
- Real-time quality checks
- Green border when aligned
- Alerts for glare/blur
- Buttonless auto-capture when criteria met

### 4. OCR & Data Preview
- Minimalist card showing extracted fields
- Editable text fields for OCR corrections
- Next button with gradient styling

### 5. Selfie & Liveness Check
- Live camera feed with face outline overlay
- On-screen prompts with animated icons
- Real-time liveness detection feedback
- Preview selfie before submission

### 6. Review & Confirm
- Three-column layout (ID images, OCR data, selfie)
- Confirm & Submit button fixed at bottom
- Progress bar at 90%

### 7. Processing Animation
- Full-screen loader with reassuring message
- Subtle animation (rotating shield)
- Step-by-step processing feedback

### 8. Result Screen
- Approved: Green check animation with reference number
- Pending: Neutral tone with notification message
- Rejected: Red warning with clear next steps
- Download/Email receipt options

## 🧩 Components

### Core Components
- `ModernKYCFlow.tsx` - Main orchestrator managing all steps
- `KYCWelcome.tsx` - Welcome and onboarding screen
- `IDTypeSelection.tsx` - ID type selection interface
- `IDScan.tsx` - Camera-based ID scanning
- `OCRDataPreview.tsx` - OCR data review and editing
- `SelfieCapture.tsx` - Selfie capture with liveness detection
- `ReviewAndConfirm.tsx` - Final review and confirmation
- `ProcessingAnimation.tsx` - Processing animation and feedback
- `ResultScreen.tsx` - Result display with different states

## 🎨 UI/UX Standards

### Design Principles
- **Mobile-first, responsive design**
- **Accessibility (WCAG 2.1 AA compliance)**
- **Micro-interactions for user engagement**
- **Secure image handling (in-memory storage)**
- **Local caching until internet available**

### Color Scheme
- Primary: Blue gradient (`from-blue-600 to-purple-600`)
- Success: Green (`text-green-600`)
- Warning: Yellow (`text-yellow-600`)
- Error: Red (`text-red-600`)
- Background: Soft gradients (`from-blue-50 via-white to-purple-50`)

### Typography
- Headings: `text-2xl font-bold` to `text-3xl font-bold`
- Body: `text-gray-600` with `leading-relaxed`
- Labels: `text-sm font-medium text-gray-700`

## 🚀 Usage

### Basic Implementation
```tsx
import { ModernKYCFlow } from '@/components/kyc';

export default function KYCPage() {
  return <ModernKYCFlow />;
}
```

### Individual Components
```tsx
import { 
  KYCWelcome, 
  IDTypeSelection, 
  IDScan,
  OCRDataPreview,
  SelfieCapture,
  ReviewAndConfirm,
  ProcessingAnimation,
  ResultScreen 
} from '@/components/kyc';

// Use individual components as needed
```

## 📱 Mobile Optimization

### Camera Access
- Uses `navigator.mediaDevices.getUserMedia()` for camera access
- Automatic camera selection (environment for ID, user for selfie)
- Fallback handling for camera permissions

### Touch Interactions
- Large touch targets (minimum 44px)
- Swipe gestures for navigation
- Haptic feedback simulation

## 🔒 Security Features

### Data Handling
- Images stored in-memory until submission
- No persistent storage of sensitive data
- Encrypted transmission (simulated)
- Bank-level security messaging

### Privacy Compliance
- Clear privacy policy references
- User consent for data processing
- Secure data transmission indicators

## 🎯 User Experience

### Progress Tracking
- Visual progress bar at each step
- Percentage completion indicators
- Step-by-step guidance

### Error Handling
- Clear error messages
- Retry mechanisms
- Fallback options

### Accessibility
- Screen reader support
- Keyboard navigation
- High contrast mode support
- Focus management

## 🔧 Customization

### Theming
Components can be customized by modifying:
- Color schemes in Tailwind classes
- Gradient configurations
- Icon selections from Lucide React

### Localization
- Text content can be externalized
- Support for multiple languages
- RTL layout support

### Integration
- API endpoints can be configured
- Backend integration points
- Webhook support for real-time updates

## 📊 Performance

### Optimization
- Lazy loading of components
- Image compression and optimization
- Efficient state management
- Minimal re-renders

### Monitoring
- Performance metrics tracking
- User interaction analytics
- Error reporting

## 🧪 Testing

### Component Testing
Each component includes:
- Unit tests for functionality
- Integration tests for flow
- Accessibility testing
- Mobile responsiveness testing

### User Testing
- Usability testing scenarios
- A/B testing capabilities
- Performance benchmarking

## 📚 Documentation

### API Reference
- Component props and interfaces
- Event handlers and callbacks
- State management patterns

### Examples
- Basic implementation
- Advanced customization
- Integration patterns
- Error handling

## 🔄 Future Enhancements

### Planned Features
- Biometric authentication
- Advanced liveness detection
- Multi-language support
- Offline capability
- Real-time collaboration

### Technical Improvements
- WebAssembly for image processing
- Service Worker for offline support
- Progressive Web App features
- Advanced caching strategies

## 🤖 TensorFlow.js Integration
- Uses `@tensorflow-models/blazeface` + `@tensorflow/tfjs` for basic face presence and framing checks
- Real-time guidance chips: Face detected, centered, distance
- Capture enabled only when liveness prompt completed and face is centered at good distance

## 🔽 Tenant ID Types (Dropdown)
- Fetches tenant ID types via `/api/id-types` (proxied to backend with Authorization header when available)
- Falls back to session-provided `idType` when tenant list is unavailable
- Selection now uses a dropdown (`Select`) to avoid overwhelming users with many types
