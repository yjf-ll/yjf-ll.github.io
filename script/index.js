const exec = require('child_process').exec


// exec('npm run server')
// exec('npm run clean')
// exec('npm run build')
// exec('npm run deploy')
exec('git add .',(err,stdout,stderr) => {
    if(err) {
        console.log('err',err)
    }
    console.log('stdout',stdout)
    console.log('stderr',stderr)
})
// exec('git push')

// exec('hexo g')
// exec('hexo d')
// console.log('aa')