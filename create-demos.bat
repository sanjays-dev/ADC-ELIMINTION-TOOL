@echo off
REM Create all demo directories and files

echo Creating directories...
mkdir demo-unused-java 2>nul
mkdir demo-unused-python 2>nul
mkdir demo-unused-c 2>nul

echo.
echo ========================================
echo Creating Java files...
echo ========================================

(
echo public class App {
echo     public static void main(String[] args) {
echo         MathUtil math = new MathUtil();
echo         int result = math.add(5, 3);
echo         System.out.println("Result: " + result);
echo         
echo         Greeter greeter = new Greeter();
echo         greeter.greet("World");
echo     }
echo }
) > demo-unused-java\App.java
echo Created: App.java

(
echo public class MathUtil {
echo     
echo     // Used method
echo     public int add(int a, int b) {
echo         return a + b;
echo     }
echo     
echo     // Unused methods
echo     public int subtract(int a, int b) {
echo         return a - b;
echo     }
echo     
echo     public int multiply(int a, int b) {
echo         return a * b;
echo     }
echo     
echo     public int divide(int a, int b) {
echo         if (b != 0) return a / b;
echo         return 0;
echo     }
echo     
echo     public double power(double a, double b) {
echo         return Math.pow(a, b);
echo     }
echo     
echo     // Unused nested class
echo     private static class Calculator {
echo         public static int calculate(int x, int y) {
echo             return x + y;
echo         }
echo     }
echo     
echo     // Unused field
echo     private static final int UNUSED_CONSTANT = 999;
echo }
) > demo-unused-java\MathUtil.java
echo Created: MathUtil.java

(
echo public class Greeter {
echo     
echo     // Used method
echo     public void greet(String name) {
echo         System.out.println("Hello, " + name + "!");
echo     }
echo     
echo     // Unused methods
echo     public void sayGoodbye(String name) {
echo         System.out.println("Goodbye, " + name);
echo     }
echo     
echo     public String formatMessage(String msg) {
echo         return "[INFO] " + msg;
echo     }
echo     
echo     public void printDate() {
echo         System.out.println("Today is " + new java.util.Date());
echo     }
echo     
echo     // Unused nested class
echo     private class MessageFormatter {
echo         public String format(String msg) {
echo             return msg.toUpperCase();
echo         }
echo     }
echo }
) > demo-unused-java\Greeter.java
echo Created: Greeter.java

(
echo public class LegacyService {
echo     
echo     // All methods are unused
echo     public void legacyMethod1() {
echo         System.out.println("Legacy method 1");
echo     }
echo     
echo     public void legacyMethod2() {
echo         System.out.println("Legacy method 2");
echo     }
echo     
echo     public String getLegacyData() {
echo         return "legacy data";
echo     }
echo     
echo     public void processingOldWay() {
echo         int[] data = new int[100];
echo         for (int i = 0; i ^< data.length; i++) {
echo             data[i] = i * 2;
echo         }
echo     }
echo     
echo     // Unused inner class
echo     public class DeprecatedHelper {
echo         public void oldHelper() {
echo             System.out.println("Old way of helping");
echo         }
echo     }
echo     
echo     // Unused fields
echo     private String legacyConfig = "config";
echo     private int[] legacyData = new int[50];
echo     private boolean legacyFlag = false;
echo }
) > demo-unused-java\LegacyService.java
echo Created: LegacyService.java

echo.
echo ========================================
echo Creating Python files...
echo ========================================

(
echo from helpers import add_numbers, greet_user
echo from config import APP_CONFIG
echo.
echo def main(^):
echo     result = add_numbers(5, 3^)
echo     print(f"Result: {result}"^)
echo     
echo     name = greet_user("Python"^)
echo     print(f"Greeted: {name}"^)
echo.
echo if __name__ == "__main__":
echo     main(^)
) > demo-unused-python\app.py
echo Created: app.py

(
echo # Used function
echo def add_numbers(a, b^):
echo     """Add two numbers"""
echo     return a + b
echo.
echo # Unused functions
echo def subtract_numbers(a, b^):
echo     """Subtract two numbers"""
echo     return a - b
echo.
echo def multiply_numbers(a, b^):
echo     """Multiply two numbers"""
echo     return a * b
echo.
echo def divide_numbers(a, b^):
echo     """Divide two numbers"""
echo     if b != 0:
echo         return a / b
echo     return 0
echo.
echo def power(a, b^):
echo     """Calculate power"""
echo     return a ** b
echo.
echo # Used function
echo def greet_user(name^):
echo     """Greet a user"""
echo     return f"Hello, {name}!"
echo.
echo # Unused functions
echo def goodbye_user(name^):
echo     """Say goodbye to user"""
echo     return f"Goodbye, {name}!"
echo.
echo def format_message(msg^):
echo     """Format message with prefix"""
echo     return f"[INFO] {msg}"
echo.
echo def log_error(error^):
echo     """Log an error"""
echo     print(f"ERROR: {error}"^)
echo.
echo UNUSED_CONSTANT = 999
echo LEGACY_CONFIG = "old config"
echo DEBUG_MODE = False
) > demo-unused-python\helpers.py
echo Created: helpers.py

(
echo # This entire module is unused
echo.
echo def legacy_function_1(^):
echo     """Old function that is never called"""
echo     return "legacy 1"
echo.
echo def legacy_function_2(^):
echo     """Another old function"""
echo     print("Processing in old way"^)
echo.
echo class LegacyProcessor:
echo     """Old processor class - deprecated"""
echo     
echo     def __init__(self^):
echo         self.config = "old"
echo     
echo     def process(self, data^):
echo         return data
echo.
echo LEGACY_TIMEOUT = 30
echo OLD_API_KEY = "deprecated"
echo DEPRECATED_URL = "http://old.api.com"
) > demo-unused-python\legacy.py
echo Created: legacy.py

(
echo # Application configuration
echo.
echo # Used config
echo APP_CONFIG = {
echo     "name": "DeadCodeDetector",
echo     "version": "2.0"
echo }
echo.
echo # Unused config
echo LEGACY_CONFIG = {
echo     "old_version": "1.0",
echo     "deprecated_key": "value"
echo }
echo.
echo DEBUG_LEVEL = 5
echo LOG_FILE = "/tmp/old.log"
echo MAX_RETRIES = 10
) > demo-unused-python\config.py
echo Created: config.py

echo.
echo ========================================
echo Creating C files...
echo ========================================

(
echo #ifndef MATH_H
echo #define MATH_H
echo.
echo int add_numbers(int a, int b^);
echo int subtract_numbers(int a, int b^);
echo int multiply_numbers(int a, int b^);
echo int divide_numbers(int a, int b^);
echo double power_function(double a, double b^);
echo.
echo void greet_user(const char* name^);
echo void log_message(const char* msg^);
echo void log_error(const char* error^);
echo.
echo #endif
) > demo-unused-c\math.h
echo Created: math.h

(
echo #include ^<stdio.h^>
echo #include "math.h"
echo.
echo int main(^) {
echo     int a = 10, b = 5;
echo     
echo     int result = add_numbers(a, b^);
echo     printf("Result: %%d\n", result^);
echo     
echo     greet_user("World"^);
echo     
echo     return 0;
echo }
) > demo-unused-c\main.c
echo Created: main.c

(
echo #include ^<stdio.h^>
echo #include ^<math.h^>
echo.
echo int add_numbers(int a, int b^) {
echo     return a + b;
echo }
echo.
echo int subtract_numbers(int a, int b^) {
echo     return a - b;
echo }
echo.
echo int multiply_numbers(int a, int b^) {
echo     return a * b;
echo }
echo.
echo int divide_numbers(int a, int b^) {
echo     if (b != 0^) return a / b;
echo     return 0;
echo }
echo.
echo double power_function(double a, double b^) {
echo     return pow(a, b^);
echo }
echo.
echo int max_value(int a, int b^) {
echo     return (a ^> b^) ? a : b;
echo }
echo.
echo int min_value(int a, int b^) {
echo     return (a ^< b^) ? a : b;
echo }
echo.
echo static int unused_global_counter = 0;
echo static const int UNUSED_MAX_SIZE = 1000;
) > demo-unused-c\math.c
echo Created: math.c

(
echo #include ^<stdio.h^>
echo #include ^<string.h^>
echo #include ^<stdlib.h^>
echo.
echo void greet_user(const char* name^) {
echo     printf("Hello, %%s!\n", name^);
echo }
echo.
echo void log_message(const char* msg^) {
echo     printf("[INFO] %%s\n", msg^);
echo }
echo.
echo void log_error(const char* error^) {
echo     printf("[ERROR] %%s\n", error^);
echo }
echo.
echo void debug_log(const char* msg^) {
echo     printf("[DEBUG] %%s\n", msg^);
echo }
echo.
echo static int unused_counter = 0;
echo static const int LEGACY_BUFFER_SIZE = 256;
) > demo-unused-c\utils.c
echo Created: utils.c

(
echo #include ^<stdio.h^>
echo #include ^<stdlib.h^>
echo #include ^<string.h^>
echo.
echo void legacy_function_1(^) {
echo     printf("Legacy function 1\n"^);
echo }
echo.
echo void legacy_function_2(^) {
echo     printf("Legacy function 2\n"^);
echo }
echo.
echo void process_old_way(int* data, int size^) {
echo     for (int i = 0; i ^< size; i++^) {
echo         data[i] = data[i] * 2;
echo     }
echo }
echo.
echo typedef struct {
echo     int id;
echo     char name[50];
echo     int value;
echo } LegacyData;
echo.
echo static int legacy_counter = 0;
echo static const int LEGACY_TIMEOUT = 30;
) > demo-unused-c\legacy.c
echo Created: legacy.c

echo.
echo ========================================
echo ✅ All demo projects created!
echo ========================================
echo.
echo Test them:
echo   node cli.js scan ./demo-unused-java --verbose
echo   node cli.js scan ./demo-unused-python --verbose
echo   node cli.js scan ./demo-unused-c --verbose
echo.
