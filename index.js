const express = require("express");
const users = require("./MOCK_DATA.json");
const fs = require('fs');

const app = express();
const PORT = 8000;

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));

// Route to render a list of users
app.get('/users', (req, res) => {
    const html = `
    <ul>
    ${users.map((user) => `<li>${user.first_name}</li>`).join("")} 
    </ul>
    `
    res.send(html);
});

// REST API routes for individual users
app.route('/api/users/:id')
    // Get user by ID
    .get((req, res) => {
        const id = Number(req.params.id);
        const user = users.find((user) => user.id == id);
        return res.json(user);
    })
    // Update user by ID (PATCH)
    .patch((req, res) => {
        // Extract ID from request parameters
        const id = Number(req.params.id);
        // Find the index of the user in the users array
        const userIndex = users.findIndex((user) => user.id === id);

        // If user not found, return 404
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Extract updated user data from request body
        const updatedUserData = req.body;

        // Update user data
        Object.assign(users[userIndex], updatedUserData);

        // Write the updated users array back to the JSON file
        fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            console.log(`User with id ${id} updated successfully.`);
            return res.json({ status: "done" });
        });
    })
    // Delete user by ID
    .delete((req, res) => {
        // Extract ID from request parameters
        const id = Number(req.params.id);
        // Find the index of the user in the users array
        const userIndex = users.findIndex((user) => user.id === id);

        // If user not found, return 404
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove the user from the array
        users.splice(userIndex, 1);

        // Write the updated users array back to the JSON file
        fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            console.log(`User with id ${id} deleted successfully.`);
            return res.json({ status: "done" });
        });
    });

// Route to get all users
app.get('/api/users', (req, res) => {
    return res.json({ users });
})

// Route to add a new user
app.post('/api/users', (req, res) => {
    const body = req.body;
    // Generate an ID for the new user
    const newUserId = users.length + 1;
    // Add the new user to the users array
    users.push({ ...body, id: newUserId });
    // Write the updated users array back to the JSON file
    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users), (err, data) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        console.log(`New user added with id ${newUserId}`);
        return res.json({ status: `done with added id` });
    })
});

// Start the server
app.listen(PORT, () => console.log(`Server Started at Port ${PORT}`));
