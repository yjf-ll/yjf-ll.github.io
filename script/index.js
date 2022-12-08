class Future {

    constructor(callback = (res,rej) => {}) {

    }

    then() {

    }
}

async function test() {
    const res = await new Promise((res,rej) => {
        setTimeout(() => {
            console.log('test');
            res(1)
        },1000)
    })
    console.log(res);
} 

test()