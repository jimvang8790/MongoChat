const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

// Connect to Mongodb
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db) {
    if (err) {
        throw err;
    }
    
    console.log('MongoDB Connected...')

    // Connect to Socket.io
    client.on('connection', function () {
        let chat = db.collection('chats');

        // Create function to send status
        sendStatus = function (s) {
            socket.emit('status', s); // a function to emit the status
        } // end sendStatus

        // Get chats from mongo collection
        // character limit is 100 and sorted by id
        chat.find().limit(100).sort({_id:1}).toArray(function (err, res) {
            if (err) {
                throw err;
            }

            // emit the messages (emit the res)
            socket.emit('output', res);
        }) // end chat.find

        // Handle input events (when message on the client side is sent)
        socket.on('input', function (data) {
            let name = data.name;
            let message = data.message;

            // check for name and massage
            if (name == '' || message == '') {
                // send error status
                sendStatus('Please enter a name and status');
            } else {
                // insert message to database
                chat.insert({name: name, message: message}, function () {
                    client.emit('output', [data]);

                    // send status object
                    sendStatus({
                        message: 'Message Sent',
                        clear: true
                    }); // end sendStatus
                }); // end chat.insert
            }
        }) // end socket.on

        // Handle clear button function
        socket.on('clear', function (data) {
           // remove all chat history
           chat.remove({}, function () {
               // emit cleard
               socket.emit('clear');
           }); // end chat.remove
        }); // end socket.on
    }); // end client.on function
}); // end mongo.connect function
