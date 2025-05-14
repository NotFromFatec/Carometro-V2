package com.carometro.dto;

import java.util.List;

public record EgressoDTO(
    String id,
    String name,
    String profileImage,
    String faceImage,
    String facePoints,
    String course,
    String graduationYear,
    String personalDescription,
    String careerDescription,
    boolean verified,
    String username,
    boolean termsAccepted,
    String inviteCode,
    List<String> contactLinks
) {}
