const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

let submissions = [];

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Get submitted data
app.get('/data', (req, res) => {
    res.json(submissions);
});

// Form submission route
app.post('/submit', (req, res) => {
    const { ra, rz, rq, process } = req.body;

    const limits = {
        'super finishing': { min: 0.01, max: 0.2 },
        'lapping': { min: 0.025, max: 0.4 },
        'polishing': { min: 0.01, max: 0.4 },
        'honing': { min: 0.1, max: 0.8 },
        'grinding': { min: 0.05, max: 1.6 },
        'boring': { min: 0.2, max: 6.3 },
        'turning': { min: 0.2, max: 6.3 },
        'drilling': { min: 1.6, max: 3.3 },
        'extruding': { min: 0.8, max: 3.3 },
        'drawing': { min: 1.6, max: 3.3 },
        'milling': { min: 1.6, max: 6.3 },
        'shaping': { min: 1.6, max: 25 },
        'planing': { min: 1.6, max: 25 }
    };

    const limit = limits[process.toLowerCase()];
    let status = 'Accepted';

    if (limit) {
        if (ra < limit.min || ra > limit.max || rz < limit.min || rz > limit.max || rq < limit.min || rq > limit.max) {
            status = 'Rejected';
        }
    } else {
        status = 'Invalid Process';
    }

    submissions.push({ ra, rz, rq, process, status });
    res.redirect('/');
});

// Delete submission route (updated to ensure correct index handling)
app.post('/delete', (req, res) => {
    const { index } = req.body;

    // Validate the index
    if (index >= 0 && index < submissions.length) {
        submissions.splice(index, 1);
        res.status(200).json({ message: 'Submission deleted successfully' });
    } else {
        res.status(400).json({ error: 'Invalid index' });
    }
});

// Feedback submission route
app.post('/submitFeedback', async (req, res) => {
    const { email, comments } = req.body;

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use your email service
        auth: {
            user: 'your_email@gmail.com', // Your email address
            pass: 'your_password' // Your email password or an app password
        }
    });

    const mailOptions = {
        from: email,
        to: 'recipient_email@example.com', // Recipient's email address
        subject: 'Feedback Submission',
        text: `Email: ${email}\nComments: ${comments}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('Feedback submitted successfully!');
    } catch (error) {
        console.error('Error sending email:', error); // Log the error
        res.status(500).send('Failed to send feedback');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
