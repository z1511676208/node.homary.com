/*
 * @Author       : JHao
 * @Date         : 2023-09-03 14:28:48
 * @LastEditors  : JHao
 * @LastEditTime : 2023-09-03 18:55:50
 */
module.exports = {
    // apps是一个json结构的数组 ，每一个数组成员对应一个pm2中运行的应用
    apps: [
        {
            port: 3002,
            // 应用程序名称
            name: 'node.homary.com',
            // 执行文件
            script: 'index.js',
            args: 'start',
            // 应用程序启动模式，这里设置的是 cluster_mode（集群），默认是fork
            exec_mode: 'fork',
            // 应用启动实例个数，仅在cluster模式有效 默认为fork；或者 max
            instances: 1,
            // 最大内存限制数，超出自动重启
            max_memory_restart: '1500M',
            // 自定义应用程序的错误日志文件(错误日志文件)
            out_file: '/dev/null',
            error_file: './logs/node-homary-com-err.log',
            // 自定义应用程序日志文件(正常日志文件)
            // out_file: './logs/nuxt-mall-mobile-out.log',
            // 设置追加日志而不是新建日志
            merge_logs: true,
            // 指定日志文件的时间格式
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            // 最小运行时间，这里设置的是60s即如果应用程序在* 60s内退出，pm2会认为程序异常退出，此时触发重启* max_restarts设置数量，应用运行少于时间被认为是异常启动
            min_uptime: '60s',
            // 设置应用程序异常退出重启的次数，默认15次（从0开始计数）,最大异常重启次数，即小于min_uptime运行时间重启次数；
            max_restarts: 10,
            // 启用/禁用应用程序崩溃或退出时自动重启，默认为true, 发生异常的情况下自动重启
            autorestart: true
        }
    ]
}
