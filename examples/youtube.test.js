const { YouTube } = require('../src/index');
const youtube = new YouTube({
    channels: [ 'UCaZGQt419Ptsdk_lh2mz9lQ', 'UCna9_me1UQAu3zbxv-dIhCQ' ], // Array of channels (required)
    postedVideos: [ "" ], // Array of videos that have been posted (optional)
    interval: 1000 // check channels every 1000ms (1 second) (optional) (default: 60000 [60 seconds])]) 
});

youtube.on('ready', (ready) => {
    console.log('Youtube connected at: ', ready);
});

youtube.on('upload', video => {
    console.log('Youtube uploaded video');
})