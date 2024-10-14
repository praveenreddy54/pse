const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Path to your service account credentials.json
const CREDENTIALS_PATH = path.join(__dirname, 'webpagetss-4e615756a74e.json');

// Load client secrets from a local file
const loadCredentials = () => {
    try {
        const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        console.error('Error reading credentials file:', err);
        throw err;
    }
};

// Authorize and create a client
const authorize = (credentials) => {
    const { client_email, private_key } = credentials;

    if (!client_email || !private_key) {
        throw new Error('Invalid credentials.json format.');
    }

    const auth = new google.auth.JWT(
        client_email,
        null,
        private_key,
        ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file']
    );

    return new Promise((resolve, reject) => {
        auth.authorize((err, tokens) => {
            if (err) {
                console.error('Error during authorization:', err);
                reject(err);
            } else {
                resolve(auth);
            }
        });
    });
};

// Upload file to Google Drive and return the file URL
const uploadFileToDrive = (auth, filePath) => {
    return new Promise((resolve, reject) => {
        const drive = google.drive({ version: 'v3', auth });
        const fileMetadata = {
            name: path.basename(filePath),
        };
        const media = {
            mimeType: 'image/jpeg', // Update to the correct MIME type if necessary
            body: fs.createReadStream(filePath),
        };

        drive.files.create(
            {
                resource: fileMetadata,
                media: media,
                fields: 'id',
            },
            (err, file) => {
                if (err) {
                    console.error('Error uploading file to Drive:', err);
                    reject(err);
                } else {
                    const fileId = file.data.id;
                    const fileUrl = `https://drive.google.com/uc?id=${fileId}`;
                    resolve(fileUrl);
                }
            }
        );
    });
};

// Append data to the Google Sheets
const appendDataToSheet = async (auth, data) => {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1MlGppK2NHDLr5i0u4GZxQvnV2L2cz5So7jhpGoyJYc0'; // Replace with your Google Sheets ID
    const range = 'Sheet1!A1'; // Update the range to match the number of columns
    const valueInputOption = 'RAW';
    const resource = {
        values: [data],
    };

    try {
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption,
            resource,
        });
        console.log('Data appended successfully:', response.data);
    } catch (err) {
        console.error('Error appending data:', err);
    }
};

// Export function for external use
module.exports = {
    appendDataToSheet: async (data, photoPath) => {
        try {
            const credentials = loadCredentials();
            const auth = await authorize(credentials);
            let photoUrl = 'No file uploaded';
            if (photoPath) {
                photoUrl = await uploadFileToDrive(auth, photoPath);
            }
            data.push(photoUrl); // Add the photo URL to the data array
            await appendDataToSheet(auth, data);
        } catch (err) {
            console.error('Error in appendDataToSheet:', err);
        }
    },
};
