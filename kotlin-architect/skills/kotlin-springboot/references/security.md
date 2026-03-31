# Spring Security with Kotlin

## Security Configuration (Spring Security 6+)

```kotlin
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig(
    private val jwtFilter: JwtAuthenticationFilter
) {
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain =
        http
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests {
                it.requestMatchers("/api/auth/**").permitAll()
                  .requestMatchers("/api/admin/**").hasRole("ADMIN")
                  .anyRequest().authenticated()
            }
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter::class.java)
            .build()

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()
}
```

## JWT Authentication Filter

```kotlin
@Component
class JwtAuthenticationFilter(
    private val jwtService: JwtService
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        request.getHeader("Authorization")
            ?.takeIf { it.startsWith("Bearer ") }
            ?.substring(7)
            ?.let { token ->
                jwtService.validateToken(token)?.let { auth ->
                    SecurityContextHolder.getContext().authentication = auth
                }
            }
        filterChain.doFilter(request, response)
    }
}
```

## JWT Service

```kotlin
@Service
class JwtService(
    @Value("\${app.jwt.secret}") private val secret: String,
    @Value("\${app.jwt.expiration-ms}") private val expirationMs: Long
) {
    private val key: SecretKey = Keys.hmacShaKeyFor(secret.toByteArray())

    fun generateToken(userId: Long, roles: Set<String>): String =
        Jwts.builder()
            .subject(userId.toString())
            .claim("roles", roles)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + expirationMs))
            .signWith(key)
            .compact()

    fun validateToken(token: String): UsernamePasswordAuthenticationToken? =
        runCatching {
            val claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).payload
            val userId = claims.subject
            val roles = (claims["roles"] as List<*>).map { SimpleGrantedAuthority("ROLE_$it") }
            UsernamePasswordAuthenticationToken(userId, null, roles)
        }.getOrNull()
}
```

## Method-Level Security

```kotlin
@Service
class AdminService {
    @PreAuthorize("hasRole('ADMIN')")
    suspend fun deleteUser(userId: Long) { /* ... */ }

    @PreAuthorize("#userId == authentication.principal")
    suspend fun updateProfile(userId: Long, request: UpdateProfileRequest) { /* ... */ }
}
```

## CORS Configuration

```kotlin
@Bean
fun corsConfigurationSource(): CorsConfigurationSource =
    UrlBasedCorsConfigurationSource().apply {
        registerCorsConfiguration("/api/**", CorsConfiguration().apply {
            allowedOrigins = listOf("https://app.example.com")
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE")
            allowedHeaders = listOf("*")
            allowCredentials = true
            maxAge = 3600
        })
    }
```
