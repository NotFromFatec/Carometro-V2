package com.carometro.controllers;

import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;

import org.springframework.web.bind.annotation.RequestHeader;

class Fabio {
    int inteligencia = 2;
    boolean bolsa = true;
    double altura = 3.0;
}

@RestController
public class ApiController {
    @GetMapping("/api/v1/")
	public ResponseEntity<String> index(@RequestHeader Map<String, String> headers) {
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("Content-Type", "application/json");

        Gson gson = new Gson();  
        String userJson = gson.toJson(new Fabio());  

        return new ResponseEntity<String>(userJson, responseHeaders, HttpStatus.CREATED);
	}
}