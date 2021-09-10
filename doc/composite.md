## 合成图片
```
POST    /composite-image
```
### 请求参数
|参数名|说明|是否必填
|---|---|:---:
|type|类型|必填|1为png,2为gif
|width|宽度|必填
|height|高度|必填
|position_info|处理图片数组|必填
|delay_time|延迟时间|可选
|save_path|生成地址名|可选
{
    "type":1, 
    "width":1920,   
    "height":650,
    "position_info":[
        {
            "background_img":"https://img1.homary.com/ad/2021/09/16/0211a99be9d0f0e1596f48deebfa5222.jpg",
            "position":[
                {
                    "id":1,
                    "x":136,
                    "y":43,
                    "width":240.4224,
                    "height":207.0304,
                    "proportion":"1.6696",
                    "img_url":"https://img1.homary.com/fit-in/240.4224x207.0304/mall/2021/03/22/dcdd63db0ac04acda38b9077b1538bb0.jpg"
                },
                {
                    "id":2,
                    "x":1010,
                    "y":98,
                    "width":272.1448,
                    "height":213.7088,
                    "proportion":"1.6696",
                    "img_url":"https://img1.homary.com/fit-in/272.1448x213.7088/mall/2021/04/06/769fef05a463443aadbd3f8e4b9b742b.jpg"
                },
                {
                    "id":3,
                    "x":1581,
                    "y":293,
                    "width":337.2592,
                    "height":353.9552,
                    "proportion":"1.6696",
                    "img_url":"https://img1.homary.com/fit-in/337.2592x353.9552/mall/2021/04/06/41375dc22d5d4b57a1c82a6d5caa4ab8.jpg"
                },
                {
                    "id":4,
                    "x":378,
                    "y":136,
                    "width":619.4216,
                    "height":347.2768,
                    "proportion":"1.6696",
                    "img_url":"https://img1.homary.com/fit-in/619.4216x347.2768/dev/file/2021/08/21/9ab520e3d2c7443fa3e189e871751115.jpg"
                }
            ]
        }
    ],
    "delay_time":1000,
    "save_path":"materials/2021/09/16/154_1920×650_20210916.png"
}

### 注册成功返回数据
```json
{
    "res": {
        "code": 1,
        "data": {
            "url_path": "materials/2021/09/17/22*23553.gif",
            "img_url": "https://media-local-s3.s3.amazonaws.com/materials/2021/09/17/22*23553.gif"
        },
        "info": "ok"
    }
}
```
