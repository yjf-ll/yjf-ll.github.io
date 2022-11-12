const {exec} = require("child_process");
exec('git add .',(err,stdout,stderr) => {
    if(err) {
        console.log('err',err)
    }
    console.log('stdout',stdout)
    console.log('stderr',stderr)
})