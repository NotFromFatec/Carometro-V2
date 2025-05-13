package com.carometro.controllers;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class IndexController {
    // Forward all non-API, non-static requests to index.html for SPA routing
    @RequestMapping(value = {"/{path:^(?!api|assets|egresso-images|placeholder\\.png|vite\\.svg|index\\.html).*$}", "/{path:^(?!api|assets|egresso-images|placeholder\\.png|vite\\.svg|index\\.html).*$}/**"})
    public String forward() {
        return "forward:/index.html";
    }

    @CacheEvict(value = "first", allEntries = true)
    public void evictAllCacheValues() {}
}

