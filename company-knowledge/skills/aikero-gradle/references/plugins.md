# Aikero Gradle Plugins

Aikero provides custom Gradle plugins published to the company Nexus repository. These plugins standardize build configuration, dependency management, and publishing across all Aikero projects.

## version-catalog Plugin

`team.aikero.gradle.plugin.version-catalog`

- Imports Blade framework version catalog as a Maven artifact
- Provides type-safe dependency accessors: `commonLibs.blade.xxx`
- Configured in `settings.gradle.kts` via `versionCatalogConf { artifactVersion = frameworkVersion }`
- Doc: [Version Catalog](https://aikero-docs.robotees.tech/gradle/plugins/version-catalog.html)

## common-conf Plugin

`team.aikero.gradle.plugin.common-conf`

- Configures repositories (Nexus, Maven Central, Gradle Plugin Portal)
- Sets Kotlin compiler options (`-Xjsr305=strict`, JVM target)
- Configures test framework (JUnit Platform)
- Adds Kover for code coverage (95% minimum)
- Doc: [Common Conf](https://aikero-docs.robotees.tech/gradle/plugins/common-conf.html)

## publish-conf Plugin

`team.aikero.gradle.plugin.publish-conf`

- Configures Maven publication for SDK/library modules
- Targets Nexus snapshot/release repositories based on version suffix
- Reads credentials from `~/.gradle/gradle.properties`
- Doc: [Publish Conf](https://aikero-docs.robotees.tech/gradle/plugins/publish-conf.html)

## api-version-generator Plugin

- Auto-generates API version constants from Gradle properties
- Used for SDK versioning and endpoint compatibility checks
- Doc: [API Version Generator](https://aikero-docs.robotees.tech/gradle/plugins/api-version-generator.html)

## Plugin Usage Guide

- [How to Use Plugins](https://aikero-docs.robotees.tech/gradle/plugins/plugin-use.html)
- [Plugin Common Utilities](https://aikero-docs.robotees.tech/gradle/plugins/plugin-common.html)

## KSP Configuration for Blade

When using Blade's version generation:

```kotlin
ksp {
    arg("bladeVersion", project.version.toString())
    arg("moduleGen", "true")
    arg("moduleName", project.name)
}
```

This generates `[ModuleName]Version` objects implementing `VersionInfo` interface at compile time.
