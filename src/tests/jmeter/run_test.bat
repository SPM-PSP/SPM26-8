@echo off
echo ================================================
echo DDL-Master JMeter 性能测试启动脚本
echo ================================================
echo.

:: 检查JMeter是否可用
jmeter -v >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到JMeter，请确保JMeter已添加到系统环境变量PATH中
    pause
    exit /b 1
)

echo 后端服务地址: http://localhost:8080
echo 测试计划: ddl_performance_test.jmx
echo 结果输出目录: report
echo.

:: 创建结果目录
if not exist report mkdir report

:: 运行JMeter测试（非GUI模式）
echo 正在启动性能测试...
echo.
jmeter -n -t ddl_performance_test.jmx -l report/result.jtl -e -o report/html

if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo 测试完成!
    echo 结果文件: report/result.jtl
    echo HTML报告: report/html/index.html
    echo ================================================
) else (
    echo.
    echo ================================================
    echo 测试失败，请检查错误信息
    echo ================================================
)

pause
