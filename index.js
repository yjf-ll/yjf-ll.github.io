const {exec} = require("child_process");

function script(command) {
    return new Promise((res,rej) => {
        exec(command,(err,stdout,stderr) => {
            if(stdout) {
                console.log(`开始执行${command}`);
                res(stdout);
            } else if(err) {
                rej(`${command}${err}`);
            }
            else{
                rej(`${command}${stderr}`);
            }
        });
    });
}

const git = async() => {
    try {
        await script("git add .");
        await script("git commit -m 'test'");
        await script("git push");
        console.log("git提交完成");
    } catch (e) {
        throw Error(`git err${e}`);
    }
};

const deployBlog = async() => {
    try {
        await script("npm run clean");
        await script("npm run build");
        await script("npm run deploy");
        console.log("博客部署完成");
    } catch (e) {
        throw Error(`blog err${e}`);
    }
};

const start = () => {
    // deployBlog().then(
    //     console.log("结束")
    // );
    git().then(res => {
        deployBlog().then(
            console.log("结束")
        );
    });
};

// start();

exec('git add .',{},(err,stdout,stderr) => {
    if(stdout) {
        console.log(`开始执行`);
    } else if(err) {
        console.log(`err err`);

    }
    else{
        console.log(`stderr err`);
    }
});