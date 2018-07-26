# Complex Algorithm & File Management Strategies

## Complex Algorithm

Multithreaded quicksort (most likely)

## File Management

### Local

The file structure of the development environment is as follows.

The `src` folder contains all javascript and css source files.

- React components, or components that will appear visually on the application, are located in the `components` subfolder.

- CSS files that are relevant to a specific React component are named exactly the same as the file that contains it.

- Object classes are stored in the `classes` subfolder.

- Forms are stored in the `forms` subfolder. These are special React components that are designed to save or submit user-input data to a parent component.

- Individual pages of the application are stored in the `pages` subfolder.

The `public` folder contains any files that are directly accessible and will not be processed by the React compiler.

### Database & File storage

The application uses Firebase for database and file storage solutions.

- The database stores all data including projects and users in the format of a JSON tree hierachy.
- Uploaded files are stored in file storage. The files are not categorised into folders, but adopts a timestamp-uid naming system. All file metadata is stored in the database.

### Backup plan


The project is synced to GitHub, and Google Drive. It is backed up periodically to a USB flash drive.