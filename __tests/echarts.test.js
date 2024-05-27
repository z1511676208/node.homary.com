const request = require('../request/supertest')

// 测试用例链接：
/**
http://localhost:3002/chart/linechart?option={%22xAxis%22:{%22data%22:[%2203-04~03-10%22],%22show%22:true,%22axisLabel%22:{%22interval%22:0,%22rotate%22:45}},%22yAxis%22:{%22show%22:true},%22legend%22:{%22show%22:true},%22series%22:[{%22data%22:[{%22value%22:0.99,%22label%22:{%22formatter%22:%2212%%22}}],%22symbolSize%22:5,%22symbol%22:%22circle%22,%22type%22:%22line%22,%22label%22:{%22show%22:true,%22color%22:%22red%22}}],%22width%22:300,%22height%22:150,%22top%22:40,%22scale%22:1.1}

http://localhost:3002/chart/linechart?option={%22xAxis%22:{%22data%22:[%2203-04~03-10%22],%22show%22:true,%22axisLabel%22:{%22interval%22:0,%22rotate%22:45}},%22yAxis%22:{%22show%22:true},%22legend%22:{%22show%22:true},%22series%22:[{%22data%22:[{%22value%22:0.99,%22label%22:{%22formatter%22:%2212%%22}}],%22symbolSize%22:5,%22symbol%22:%22circle%22,%22type%22:%22line%22,%22label%22:{%22show%22:true,%22color%22:%22red%22}}],%22width%22:300,%22height%22:150,%22top%22:40,%22scale%22:1.1}

http://localhost:3002/chart/linechart?option={%22xAxis%22:{%22data%22:[%22A%22,%22B%22,%22C%22,%22D%22,%22E%22],%22show%22:false},%22yAxis%22:{%22show%22:false},%22series%22:[{%22data%22:[10,22,28,23,19],%22type%22:%22line%22,%22label%22:{%22show%22:true}},{%22data%22:[10,10,10,10,10],%22type%22:%22line%22,%22label%22:{%22show%22:true}}],%22width%22:300,%22height%22:150}
 */
test('测试生成 charts 图片', async () => {
  const queryParams = {
    option: '{"xAxis":{"data":["A","B","C","D","E"],"show":false},"yAxis":{"show":false},"series":[{"data":[10,22,28,23,19],"type":"line","label":{"show":true}},{"data":[10,10,10,10,10],"type":"line","label":{"show":true}}],"width":300,"height":150}'
  };
  const response = await request.get('/chart/linechart').query(queryParams)
  expect(response.type).toBe('image/png');
  expect(response.status).toBe(200);
});

// test('测试生成 email 图片', async () => {
//   const queryParams = {
//     url: 'http://localhost:5173/coupon-hint-2?params={%22coupon_user_id_str%22:%22145669,145670,145671,145672,145673,145674,145675,145676,145677,145678%22,%22site%22:%22us%22,%22email_business_code%22:1,%22pf%22:%22pc%22,%22language%22:%22en%22,%22currency%22:%22usd%22,%22eid%22:%22EE2D957C-F190-42E6-8BEE-6A23A4FAB508-1702432244025%22,%22user_id%22:%222438273%22,%22email%22:%22zhuce207@popicorns.com%22,%22template_code%22:%22coupon_hint%22}'
//   }; // 替换为你的GET请求的参数
//   const response = await request.get('/email/screenshot').query(queryParams).timeout(60 * 1000)
//   expect(response.status).toBe(200);
// })
//
