const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const googleSheets = require('./googleSheets');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

const app = express();
const port = 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Route to handle form submission
app.post('/submit_form', upload.single('photo'), async (req, res) => {
    const {
        name,
        contact,
        email,
        rollno,
        txnid,
        sports,
        'team-members': teamMembers,
        amount,
        category,
        formType
    } = req.body;

    // Log the received data for debugging
    // console.log('Form data received:', {
    //     name,
    //     contact,
    //     email,
    //     rollno,
    //     txnid,
    //     sports,
    //     teamMembers,
    //     amount,
    //     category,
    //     formType
    // });

    const photoPath = req.file ? req.file.path : 'No file uploaded';

    let formData = [];

    switch (formType) {
        case 'cultural':
            formData = [name, contact, email, rollno, null, null, teamMembers, category, formType, null];
            break;
        case 'sports':
            formData = [name, contact, email, rollno, txnid, sports, teamMembers, amount, null, formType, photoPath];
            break;
        case 'food':
            formData = [name, contact, email, rollno, txnid, null, null, null, null, formType, photoPath];
            break;
        case 'volunteer':
            formData = [name, contact, email, rollno, null, null, null, null, null, formType, null];
            break;
        default:
            res.status(400).send('Invalid form type');
            return;
    }

    try {
        // Save data to Google Sheets
        await googleSheets.appendDataToSheet(formData);

        // Redirect to the success HTML page
        res.sendFile(path.join(__dirname, 'public', 'thank_you.html'));
    } catch (error) {
        console.error('Error saving data to Google Sheets:', error);
        res.status(500).send('Error submitting form');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
