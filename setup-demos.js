#!/usr/bin/env node

// Create directories
dirs.forEach(dir => {
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✓ Created ${dir}/`);
  }
});

// Java files
  'App.java': `public class App {
    public static void main(String[] args) {
        MathUtil math = new MathUtil();
        int result = math.add(5, 3);
        System.out.println("Result: " + result);
        
        Greeter greeter = new Greeter();
        greeter.greet("World");
    }
}`,
  'MathUtil.java': `public class MathUtil {
    
    // Used method
    public int add(int a, int b) {
        return a + b;
    }
    
    // Unused methods
    public int subtract(int a, int b) {
        return a - b;
    }
    
    public int multiply(int a, int b) {
        return a * b;
    }
    
    public int divide(int a, int b) {
        if (b != 0) return a / b;
        return 0;
    }
    
    public double power(double a, double b) {
        return Math.pow(a, b);
    }
    
    // Unused nested class
    private static class Calculator {
        public static int calculate(int x, int y) {
            return x + y;
        }
    }
    
    // Unused field
    private static final int UNUSED_CONSTANT = 999;
}`,
  'Greeter.java': `public class Greeter {
    
    // Used method
    public void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }
    
    // Unused methods
    public void sayGoodbye(String name) {
        System.out.println("Goodbye, " + name);
    }
    
    public String formatMessage(String msg) {
        return "[INFO] " + msg;
    }
    
    public void printDate() {
        System.out.println("Today is " + new java.util.Date());
    }
    
    // Unused nested class
    private class MessageFormatter {
        public String format(String msg) {
            return msg.toUpperCase();
        }
    }
}`,
  'LegacyService.java': `public class LegacyService {
    
    // All methods are unused
    public void legacyMethod1() {
        System.out.println("Legacy method 1");
    }
    
    public void legacyMethod2() {
        System.out.println("Legacy method 2");
    }
    
    public String getLegacyData() {
        return "legacy data";
    }
    
    public void processingOldWay() {
        int[] data = new int[100];
        for (int i = 0; i < data.length; i++) {
            data[i] = i * 2;
        }
    }
    
    // Unused inner class
    public class DeprecatedHelper {
        public void oldHelper() {
            System.out.println("Old way of helping");
        }
    }
    
    // Unused fields
    private String legacyConfig = "config";
    private int[] legacyData = new int[50];
    private boolean legacyFlag = false;
}`
};

// Python files
  'app.py': `from helpers import add_numbers, greet_user
from config import APP_CONFIG

def main():
    result = add_numbers(5, 3)
    print(f"Result: {result}")
    
    name = greet_user("Python")
    print(f"Greeted: {name}")

if __name__ == "__main__":
    main()`,
  'helpers.py': `# Used function
def add_numbers(a, b):
    """Add two numbers"""
    return a + b

# Unused functions
def subtract_numbers(a, b):
    """Subtract two numbers"""
    return a - b

def multiply_numbers(a, b):
    """Multiply two numbers"""
    return a * b

def divide_numbers(a, b):
    """Divide two numbers"""
    if b != 0:
        return a / b
    return 0

def power(a, b):
    """Calculate power"""
    return a ** b

# Used function
def greet_user(name):
    """Greet a user"""
    return f"Hello, {name}!"

# Unused functions
def goodbye_user(name):
    """Say goodbye to user"""
    return f"Goodbye, {name}!"

def format_message(msg):
    """Format message with prefix"""
    return f"[INFO] {msg}"

def log_error(error):
    """Log an error"""
    print(f"ERROR: {error}")

# Unused class
class Calculator:
    def __init__(self):
        self.history = []
    
    def calculate(self, a, b, op):
        if op == '+':
            return a + b
        elif op == '-':
            return a - b
    
    def get_history(self):
        return self.history

# Unused global variable
UNUSED_CONSTANT = 999
LEGACY_CONFIG = "old config"
DEBUG_MODE = False`,
  'legacy.py': `# This entire module is unused

def legacy_function_1():
    """Old function that is never called"""
    return "legacy 1"

def legacy_function_2():
    """Another old function"""
    print("Processing in old way")
    data = [1, 2, 3, 4, 5]
    for item in data:
        pass

def process_old_way(input_data):
    """Process data using deprecated method"""
    result = {}
    for idx, val in enumerate(input_data):
        result[idx] = val * 2
    return result

class LegacyProcessor:
    """Old processor class - deprecated"""
    
    def __init__(self):
        self.config = "old"
    
    def process(self, data):
        return data
    
    def get_config(self):
        return self.config
    
    def set_config(self, cfg):
        self.config = cfg

class DeprecatedFormatter:
    """Old formatter - use new one instead"""
    
    @staticmethod
    def format_string(s):
        return s.lower()
    
    @staticmethod
    def format_number(n):
        return int(n)

# Unused helper functions
def __internal_helper_1():
    pass

def __internal_helper_2():
    pass

# Unused global variables
LEGACY_TIMEOUT = 30
OLD_API_KEY = "deprecated"
DEPRECATED_URL = "http://old.api.com"`,
  'config.py': `# Application configuration

# Used config
APP_CONFIG = {
    "name": "DeadCodeDetector",
    "version": "2.0"
}

# Unused config
LEGACY_CONFIG = {
    "old_version": "1.0",
    "deprecated_key": "value"
}

# Unused functions
def get_legacy_config():
    """Get old configuration - deprecated"""
    return LEGACY_CONFIG

def setup_legacy_mode():
    """Setup old mode - not used"""
    print("Setting up legacy mode")

def validate_old_format(data):
    """Validate using old format"""
    return isinstance(data, dict)

# Unused classes
class LegacyConfigParser:
    """Old config parser - use new one"""
    
    def parse(self, config_str):
        return eval(config_str)

class OldSettings:
    """Deprecated settings class"""
    
    def __init__(self):
        self.timeout = 30
        self.retries = 3
    
    def get_timeout(self):
        return self.timeout

# Unused global variables
DEBUG_LEVEL = 5
LOG_FILE = "/tmp/old.log"
MAX_RETRIES = 10`
};

// C files
  'math.h': `#ifndef MATH_H
#define MATH_H

int add_numbers(int a, int b);
int subtract_numbers(int a, int b);
int multiply_numbers(int a, int b);
int divide_numbers(int a, int b);
double power_function(double a, double b);

void greet_user(const char* name);
void log_message(const char* msg);
void log_error(const char* error);

#endif`,
  'main.c': `#include <stdio.h>
#include "math.h"

int main() {
    int a = 10, b = 5;
    
    // Used function call
    int result = add_numbers(a, b);
    printf("Result: %d\\n", result);
    
    // Used function call
    greet_user("World");
    
    return 0;
}`,
  'math.c': `#include <stdio.h>
#include <math.h>

// Used function
int add_numbers(int a, int b) {
    return a + b;
}

// Unused functions
int subtract_numbers(int a, int b) {
    return a - b;
}

int multiply_numbers(int a, int b) {
    return a * b;
}

int divide_numbers(int a, int b) {
    if (b != 0) return a / b;
    return 0;
}

double power_function(double a, double b) {
    return pow(a, b);
}

// Unused helper function
static int calculate_complex(int x, int y, int z) {
    int temp = x + y;
    return temp * z;
}

// Unused function
int max_value(int a, int b) {
    return (a > b) ? a : b;
}

int min_value(int a, int b) {
    return (a < b) ? a : b;
}

// Unused nested functions logic
static void process_array(int* arr, int size) {
    for (int i = 0; i < size; i++) {
        arr[i] = arr[i] * 2;
    }
}

// Unused global variables
static int unused_global_counter = 0;
static const int UNUSED_MAX_SIZE = 1000;
static const char* LEGACY_MODE = "deprecated";`,
  'utils.c': `#include <stdio.h>
#include <string.h>
#include <stdlib.h>

// Used function
void greet_user(const char* name) {
    printf("Hello, %s!\\n", name);
}

// Unused functions
void log_message(const char* msg) {
    printf("[INFO] %s\\n", msg);
}

void log_error(const char* error) {
    printf("[ERROR] %s\\n", error);
}

// Unused logging functions
void debug_log(const char* msg) {
    printf("[DEBUG] %s\\n", msg);
}

void warning_log(const char* msg) {
    printf("[WARN] %s\\n", msg);
}

// Unused string processing
char* string_to_upper(const char* str) {
    char* result = malloc(strlen(str) + 1);
    for (int i = 0; str[i]; i++) {
        result[i] = (str[i] >= 'a' && str[i] <= 'z') ? str[i] - 32 : str[i];
    }
    result[strlen(str)] = '\\0';
    return result;
}

char* string_to_lower(const char* str) {
    char* result = malloc(strlen(str) + 1);
    for (int i = 0; str[i]; i++) {
        result[i] = (str[i] >= 'A' && str[i] <= 'Z') ? str[i] + 32 : str[i];
    }
    result[strlen(str)] = '\\0';
    return result;
}

// Unused structure and functions
struct LegacyConfig {
    int timeout;
    int retries;
    char* api_key;
};

struct LegacyConfig* create_legacy_config() {
    struct LegacyConfig* cfg = malloc(sizeof(struct LegacyConfig));
    cfg->timeout = 30;
    cfg->retries = 3;
    cfg->api_key = "deprecated";
    return cfg;
}

void free_legacy_config(struct LegacyConfig* cfg) {
    free(cfg);
}

// Unused helper function
static void internal_processing() {
    printf("Internal processing in old way\\n");
}

// Unused global variables
static int unused_counter = 0;
static const int LEGACY_BUFFER_SIZE = 256;`,
  'legacy.c': `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// This entire file contains unused legacy code

void legacy_function_1() {
    printf("Legacy function 1\\n");
}

void legacy_function_2() {
    printf("Legacy function 2\\n");
}

void process_old_way(int* data, int size) {
    for (int i = 0; i < size; i++) {
        data[i] = data[i] * 2;
    }
}

typedef struct {
    int id;
    char name[50];
    int value;
} LegacyData;

LegacyData* create_legacy_data(int id, const char* name) {
    LegacyData* data = malloc(sizeof(LegacyData));
    data->id = id;
    strcpy(data->name, name);
    data->value = 0;
    return data;
}

void free_legacy_data(LegacyData* data) {
    free(data);
}

void print_legacy_data(LegacyData* data) {
    printf("ID: %d, Name: %s, Value: %d\\n", data->id, data->name, data->value);
}

// Unused helper functions
static void __helper_1() {
    printf("Helper 1\\n");
}

static void __helper_2() {
    printf("Helper 2\\n");
}

static int __internal_calc(int x, int y) {
    return x + y;
}

// Unused global variables and constants
static int legacy_counter = 0;
static const int LEGACY_TIMEOUT = 30;
static const char* LEGACY_API_URL = "http://old.api.com";
static const int MAX_LEGACY_CONNECTIONS = 10;`
};

console.log('\n📝 Creating Java files...');
Object.entries(javaFiles).forEach(([filename, content]) => {
  fs.writeFileSync(filePath, content);
  console.log(`✓ ${filename}`);
});

console.log('\n🐍 Creating Python files...');
Object.entries(pythonFiles).forEach(([filename, content]) => {
  fs.writeFileSync(filePath, content);
  console.log(`✓ ${filename}`);
});

console.log('\n⚫ Creating C files...');
Object.entries(cFiles).forEach(([filename, content]) => {
  fs.writeFileSync(filePath, content);
  console.log(`✓ ${filename}`);
});

console.log('\n✅ All demo projects created!\n');
