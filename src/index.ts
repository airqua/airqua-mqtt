import Aedes from "aedes";
import {createServer} from "node:net";
import {env} from "./env";
import {MQTT_USERNAME} from "./constants/constants";
import {AuthenticateError} from "./errors/AuthenticateError";
import {postReading} from "./modules/requests/postReading";

const aedes = new Aedes();
const server = createServer(aedes.handle);

const clients: Record<string, string> = {};

aedes.authenticate = (client, username, password, callback) => {
    if(username !== MQTT_USERNAME || !password) {
        console.warn('Failed auth (incorrect username or no password)', client.id);
        return callback(new AuthenticateError(4), null);
    }
    callback(null, true);
    clients[client.id] = Buffer.from(password).toString('base64');
    console.log('Successful auth', client.id);
}

aedes.authorizePublish = async (client, packet, callback) => {
    if (packet.topic.startsWith('$SYS')) {
        console.warn('Rejected publish to SYS topic');
        return callback(new Error('Sys is reserved'))
    }

    if(!client || !clients[client.id]) {
        console.error('No token found on file while authorizing publish')
        return callback(new Error('No token on file for publishing client'));
    }

    try {
        await postReading(
            packet.topic,
            clients[client.id],
            JSON.parse(
                (Buffer.isBuffer(packet.payload) ?
                    packet.payload :
                    Buffer.from(packet.payload)
                ).toString('base64')
            )
        );
        callback(null);
        console.log('Successful reading post', client.id);
    } catch (e) {
        console.error('Error sending reading', e);
        callback(e as Error);
    }
}

server.listen(Number(env.PORT), () => {
    console.log(`Server listening on port ${env.PORT}`);
});