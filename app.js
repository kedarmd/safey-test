const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;

const routes = require('./api/components/routes/routes');

mongoose.connect(`mongodb://${process.env.HOST}/${process.env.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.set('debug', true);
mongoose.connection
    .once('open', () => console.log('connected to database...'))
    .on('error', (error) => {
        console.log(error);
    });

app.use(express.json());
app.use('/api', routes);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
