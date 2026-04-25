#!/usr/bin/env node
/**
 * Create C demo project with unused dead code
 */


if (!fs.existsSync(cDir)) {
  fs.mkdirSync(cDir, { recursive: true });
}

console.log('⚫ Creating C demo with unused dead code...\n');

// Header file
fs.writeFileSync(path.join(cDir, 'math.h'), `#ifndef MATH_H
#define MATH_H

int add_numbers(int a, int b);
int subtract_numbers(int a, int b);
int multiply_numbers(int a, int b);
int divide_numbers(int a, int b);
double power_function(double a, double b);

void greet_user(const char* name);
void log_message(const char* msg);
void log_error(const char* error);

#endif
`);

// Main program
fs.writeFileSync(path.join(cDir, 'main.c'), `#include <stdio.h>
#include "math.h"

int main() {
    int a = 10, b = 5;
    
    // Used function call
    int result = add_numbers(a, b);
    printf("Result: %d\\n", result);
    
    // Used function call
    greet_user("World");
    
    return 0;
}
`);

// Math utilities with unused functions
fs.writeFileSync(path.join(cDir, 'math.c'), `#include <stdio.h>
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
static const char* LEGACY_MODE = "deprecated";
`);

// String utilities with unused code
fs.writeFileSync(path.join(cDir, 'utils.c'), `#include <stdio.h>
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
static const int LEGACY_BUFFER_SIZE = 256;
`);

// Legacy module - all unused
fs.writeFileSync(path.join(cDir, 'legacy.c'), `#include <stdio.h>
#include <stdlib.h>

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
static const int MAX_LEGACY_CONNECTIONS = 10;
`);

console.log('✅ C demo created with unused dead code!\n');
console.log('Files created:');
console.log('  - main.c (entry point)');
console.log('  - math.h (header)');
console.log('  - math.c (with unused functions)');
console.log('  - utils.c (with unused functions)');
console.log('  - legacy.c (all unused - entire module)\n');
console.log('Test it:');
console.log('  node cli.js scan ./demo-unused-c --verbose\n');
