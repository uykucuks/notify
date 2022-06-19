import { YouTube } from '../src';

const youtube = new YouTube({
    interval: 1000, // check channels every 1000ms (1 second) (optional) (default: 60000 [60 seconds])]) 
    useDatabase: true // use database to store videos (optional) (default: true)
});

youtube.on('ready', (ready) => {
    youtube.subscribe('UCaZGQt419Ptsdk_lh2mz9lQ'); // Subscribe to a channel
    console.log('Youtube connected at: ', ready);
});

youtube.on('upload', video => {
    console.log(video)
    console.log('Youtube uploaded video!');
});