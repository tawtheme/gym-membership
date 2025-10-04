# Gym Membership Management App

A comprehensive mobile application built with Ionic and Angular for managing gym memberships, built specifically for gym owners to manage their members, send reminders, and maintain data backups.

## Features

### 🔐 Authentication
- **Mobile Number + PIN Login**: Simple 4-digit PIN authentication system
- **Registration**: New users can register with mobile number and PIN
- **Session Management**: Automatic login persistence

### 👥 Member Management
- **Add Members**: Complete member registration with personal details
- **Edit Members**: Update member information and membership details
- **Delete Members**: Remove members from the system
- **View Members**: List all members with search and filter capabilities
- **Membership Types**: Support for Monthly, Quarterly, and Yearly memberships
- **Status Tracking**: Active/Inactive member status with expiry tracking

### 🔔 Reminder System
- **Automatic Reminders**: Auto-generated payment and renewal reminders
- **Custom Reminders**: Create custom reminders for specific members
- **Scheduled Notifications**: Local notifications for scheduled reminders
- **Reminder Types**: Payment, Renewal, and Custom reminder categories
- **Status Tracking**: Track sent and pending reminders

### 💾 Data Management & Backup
- **Local Storage**: All data stored locally using Ionic Storage
- **Backup System**: Create manual and automatic backups
- **Export/Import**: Export data to JSON files for sharing
- **Backup Frequency**: Daily, Weekly, Monthly, or Yearly backup options
- **Data Restoration**: Restore data from backup files

### ⚙️ Settings & Configuration
- **App Settings**: Notification and auto-backup preferences
- **Data Management**: Clear all data or export functionality
- **User Account**: View current user information
- **Logout**: Secure logout functionality

## Technology Stack

- **Framework**: Ionic 7 with Angular
- **Language**: TypeScript
- **Storage**: Ionic Storage (local storage)
- **Notifications**: Capacitor Local Notifications
- **File System**: Capacitor Filesystem
- **Sharing**: Capacitor Share API
- **UI Components**: Ionic Components

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Ionic CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gym-membership
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   # For web development
   ionic serve
   
   # For Android development
   ionic capacitor add android
   ionic capacitor run android
   
   # For iOS development
   ionic capacitor add ios
   ionic capacitor run ios
   ```

## Project Structure

```
src/
├── app/
│   ├── models/
│   │   └── member.interface.ts          # Data models and interfaces
│   ├── pages/
│   │   ├── login/                       # Authentication pages
│   │   ├── members/                     # Member management
│   │   └── add-member/                  # Add/Edit member form
│   ├── services/
│   │   ├── auth.ts                      # Authentication service
│   │   ├── storage.ts                   # Data storage service
│   │   └── member.ts                    # Member management service
│   ├── tabs/
│   │   ├── tab1/                        # Settings page
│   │   ├── tab2/                        # Reminders page
│   │   └── tab3/                        # Backup page
│   └── app.module.ts                    # Main app module
```

## Key Components

### Authentication Service (`auth.ts`)
- Handles user login/logout
- Manages session persistence
- PIN-based authentication

### Storage Service (`storage.ts`)
- CRUD operations for members and reminders
- Backup and restore functionality
- Data export/import capabilities

### Member Service (`member.ts`)
- Member management operations
- Reminder creation and scheduling
- Automatic reminder generation

## Usage Guide

### Getting Started
1. **First Launch**: Register with your mobile number and create a 4-digit PIN
2. **Login**: Use your mobile number and PIN to access the app
3. **Add Members**: Start by adding your gym members through the Members tab

### Managing Members
1. **Add New Member**: Tap the "+" button in the Members tab
2. **Fill Member Details**: Name, phone, email, membership type, dates
3. **Edit Member**: Swipe left on any member and tap the edit icon
4. **Delete Member**: Swipe left and tap the delete icon
5. **Send Reminders**: Swipe left and tap the notification icon

### Setting Up Reminders
1. **Automatic Reminders**: Created automatically when adding members
2. **Custom Reminders**: Create through the Reminders tab
3. **Reminder Types**: Payment, Renewal, or Custom messages
4. **Scheduling**: Set specific dates and times for reminders

### Backup & Data Management
1. **Manual Backup**: Create backups through the Backup tab
2. **Automatic Backup**: Enable in settings for scheduled backups
3. **Export Data**: Download all data as JSON files
4. **Import Data**: Restore from previously exported files

## Data Models

### Member Interface
```typescript
interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  membershipType: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  isActive: boolean;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Reminder Interface
```typescript
interface Reminder {
  id: string;
  memberId: string;
  type: 'payment' | 'renewal' | 'custom';
  title: string;
  message: string;
  scheduledDate: string;
  isSent: boolean;
  createdAt: string;
}
```

## Features in Detail

### Member Management
- **Search & Filter**: Find members by name or phone number
- **Status Indicators**: Visual badges for membership status
- **Expiry Tracking**: Automatic detection of expiring memberships
- **Membership Types**: Support for different membership durations

### Reminder System
- **Automatic Generation**: Reminders created when adding members
- **Scheduled Notifications**: Local notifications for reminders
- **Status Tracking**: Monitor sent and pending reminders
- **Custom Messages**: Create personalized reminder messages

### Backup System
- **Multiple Formats**: JSON export for data portability
- **Scheduled Backups**: Automatic backup creation
- **Data Restoration**: Import from backup files
- **Cloud Integration**: Share backups via cloud services

## Development Notes

### Adding New Features
1. Create new services in `src/app/services/`
2. Add new pages in `src/app/pages/`
3. Update routing in `app-routing.module.ts`
4. Add new models in `src/app/models/`

### Testing
- Run `ionic serve` for web testing
- Use `ionic capacitor run android/ios` for device testing
- Test on different screen sizes and orientations

### Building for Production
```bash
# Build for web
ionic build --prod

# Build for Android
ionic capacitor build android

# Build for iOS
ionic capacitor build ios
```

## Troubleshooting

### Common Issues
1. **Storage Issues**: Ensure Ionic Storage is properly initialized
2. **Notification Issues**: Check device notification permissions
3. **Backup Issues**: Verify file system permissions

### Debug Mode
- Enable console logging for debugging
- Use browser developer tools for web testing
- Check device logs for mobile testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## Future Enhancements

- [ ] Cloud synchronization
- [ ] Advanced reporting
- [ ] Payment tracking
- [ ] Multi-gym support
- [ ] Advanced analytics
- [ ] SMS integration
- [ ] Email notifications
- [ ] Member photos
- [ ] QR code scanning
- [ ] Offline mode improvements
