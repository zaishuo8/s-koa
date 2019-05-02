const m0 = (next) => { console.log('0'); next(); console.log('00') };
const m1 = (next) => { console.log('1'); next(); console.log('11') };
const m2 = (next) => { console.log('2'); next(); console.log('22') };

const middleList = [m0, m1, m2];
const length = middleList.length;

let i = 0;
const next = () => {
    if(++i < length) {
        dispatch(i);
    }
};

function dispatch(i) {
    if(i < length) {
        let fn = middleList[i];
        fn(next);
    }
}

dispatch(i);