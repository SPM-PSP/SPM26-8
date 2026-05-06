package common;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理，避免报错信息直接抛给前端
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public Result<String> handleException(Exception e) {
        // 打印异常堆栈信息到控制台，方便本地排错
        log.error("系统运行出现异常: ", e);
        // 返回友好的错误提示给小程序
        return Result.error("系统繁忙，请稍后再试：" + e.getMessage());
    }

    // 补充自定义异常的拦截，例如：
    // @ExceptionHandler(CustomBusinessException.class)
    // ...
}