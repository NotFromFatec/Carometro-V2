package com.carometro;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
@Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // Enable trailing slash match using PathPatternParser (Spring 6+)
        var patternParser = new org.springframework.web.util.pattern.PathPatternParser();
        patternParser.setMatchOptionalTrailingSeparator(true);
        configurer.setPatternParser(patternParser);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
