import Datastore from 'nedb';
const rooms = new Datastore();

rooms.ensureIndex({fieldName: 'room', unique: true});

export default {
	rooms
};
