import * as FaIcons from "react-icons/fa"
import * as SiIcons from "react-icons/si"
import * as DevIcons from "@dev.icons/react"
export function SocialsIconMapper(colored=false) {
    const socialIcons = {
        facebook: FaIcons.FaFacebook,
        messenger: colored ? DevIcons.Messenger : FaIcons.FaFacebookMessenger,
        discord: colored ? DevIcons.Discord : FaIcons.FaDiscord,
        github: colored ? DevIcons.GithubIcon : FaIcons.FaGithub,
        gmail: colored ? DevIcons.GoogleGmail : SiIcons.SiGmail,
        phonenumber:  FaIcons.FaPhoneAlt,
        linkedin: FaIcons.FaLinkedin,    
    };
    return socialIcons
}

export function DevIconsMapper(preview=false)  {
    const Icon = {
        php: preview ? FaIcons.FaPhp : DevIcons.Php,
        javascript: preview ? SiIcons.SiJavascript : DevIcons.Javascript,
        java: preview ? FaIcons.FaJava : DevIcons.Java,
        python: preview ? FaIcons.FaPython : DevIcons.Python,
        typescript: preview ? SiIcons.SiTypescript : DevIcons.Typescript,
        csharp: preview ? SiIcons.SiDotnet : DevIcons.CSharp,
        go: preview ? SiIcons.SiGo : DevIcons.Go,
        rust: preview ? FaIcons.FaRust : DevIcons.Rust,
        kotlin: preview ? SiIcons.SiKotlin : DevIcons.Kotlin, 
        swift: preview ? SiIcons.SiSwift : DevIcons.Swift,
        ruby: preview ? SiIcons.SiRuby : DevIcons.Ruby,
        dart: preview ? SiIcons.SiDart : DevIcons.Dart,
        sql: null ,
        html: preview ? FaIcons.FaHtml5 : DevIcons.Html5,
        css: preview ? SiIcons.SiCss : DevIcons.Css,
        xml: preview ? SiIcons.SiXml : null,
        yaml: preview ? SiIcons.SiYaml : DevIcons.Yaml,
        json: preview ? SiIcons.SiJson : DevIcons.Json,
        react: preview ? FaIcons.FaReact : DevIcons._React,
        vue: preview ? FaIcons.FaVuejs : DevIcons.Vue,
        angular: preview ? FaIcons.FaAngular : DevIcons.Angular,
        nextjs: preview ? SiIcons.SiNextdotjs : DevIcons.Nextjs,
        nuxt: preview ? SiIcons.SiNuxt : DevIcons.Nuxt,
        svelte: preview ? SiIcons.SiSvelte : DevIcons._Svelte,
        sveltekit: preview ? null : DevIcons.SvelteKit,
        astro: preview ? SiIcons.SiAstro : DevIcons._Astro,
        tailwindcss: preview ? SiIcons.SiTailwindcss : DevIcons.TailwindIcon,
        bootstrap: preview ? SiIcons.SiBootstrap : DevIcons.Bootstrap,
        threejs: preview ? SiIcons.SiThreedotjs :  DevIcons.Threejs,
        d3js: preview ? SiIcons.SiD3 :  DevIcons.D3,
        vite: preview ? SiIcons.SiVite :  DevIcons.Vite,
        express: preview ? SiIcons.SiExpress :  DevIcons.Express,
        nestjs: preview ? SiIcons.SiNestjs :  DevIcons.Nestjs,
        laravel: preview ? FaIcons.FaLaravel : DevIcons.Laravel,
        springboot: preview ? SiIcons.SiSpringboot : DevIcons.Spring,
        django: preview ? SiIcons.SiDjango :  DevIcons.Django,
        flask: preview ? FaIcons.FaFlask :  DevIcons.Flask,
        fastapi: preview ? SiIcons.SiFastapi :  DevIcons.Fastapi,
        rubyonrails: preview ? SiIcons.SiRubyonrails :  DevIcons.Rails,
        aspnet: preview ? SiIcons.SiDotnet :  DevIcons.Dotnet,
        nodejs: preview ? SiIcons.SiNodedotjs :  DevIcons.Nodejs,
        deno: preview ? SiIcons.SiDeno :  DevIcons.Deno,
        postgresql: preview ? SiIcons.SiPostgresql :  DevIcons.Postgresql,
        mysql: preview ? SiIcons.SiMysql :  DevIcons.Mysql,
        sqlite: preview ? SiIcons.SiSqlite :  DevIcons.Sqlite,
        mongodb: preview ? SiIcons.SiMongodb :  DevIcons.Mongodb,
        redis: preview ? SiIcons.SiRedis :  DevIcons.Redis,
        prisma: preview ? SiIcons.SiPrisma :  DevIcons.Prisma,
        docker: preview ? FaIcons.FaDocker :  DevIcons.DockerIcon,
        graphql: preview ? SiIcons.SiGraphql :  DevIcons.Graphql,
        firebase: preview ? SiIcons.SiFirebase : DevIcons.Firebase,
        postman: preview ? SiIcons.SiPostman : DevIcons.PostmanIcon,
    }
    return Icon;
};
