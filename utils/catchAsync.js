// 비동기식 함수의 오류를 잡아내는 로직
// 어차피 exports 해야 하므로 요약해서 정의
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    };
};
