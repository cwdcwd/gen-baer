export const resumeData = {
  name: "Alex Chen",
  tagline: "Full-Stack Developer & Creative Technologist",
  avatar: null as string | null, // Set to a URL or leave null
  bio: `I'm a full-stack developer with a passion for building products that sit at the intersection of design and engineering. With over 8 years of experience, I've worked across startups and agencies building everything from real-time collaboration tools to AI-powered creative platforms.

I believe the best software feels invisible -- it gets out of your way and lets you do your best work. I'm currently focused on developer tools and generative AI applications.

When I'm not shipping code, I'm usually deep in a sci-fi novel, exploring underground music scenes, or tinkering with synthesizers.`,

  projects: [
    {
      name: "Prism Engine",
      description: "A real-time collaborative design tool built with WebSockets, Canvas API, and CRDTs. Handles 50+ concurrent users with conflict-free editing.",
      url: "https://github.com/example/prism-engine",
      tags: ["TypeScript", "WebSockets", "Canvas API"],
    },
    {
      name: "Synthwave CLI",
      description: "A terminal-based music sequencer and synthesizer. Generates procedural audio using Web Audio API patterns ported to Node.js.",
      url: "https://github.com/example/synthwave-cli",
      tags: ["Node.js", "Audio", "CLI"],
    },
    {
      name: "Neural Canvas",
      description: "An AI art generation platform that combines Stable Diffusion with interactive editing tools. Used by 10k+ artists.",
      url: "https://github.com/example/neural-canvas",
      tags: ["Python", "React", "AI/ML"],
    },
    {
      name: "Dataflow",
      description: "A visual programming environment for data pipelines. Drag-and-drop interface for building ETL workflows without writing code.",
      url: "https://github.com/example/dataflow",
      tags: ["React", "D3.js", "PostgreSQL"],
    },
  ],

  socials: [
    { platform: "GitHub", url: "https://github.com/lazybaer", icon: "github" },
    { platform: "Twitter / X", url: "https://x.com/lazybaer", icon: "twitter" },
    { platform: "LinkedIn", url: "https://linkedin.com/in/lazybaer", icon: "linkedin" },
    { platform: "Hardcover", url: "https://hardcover.app/@lazybaer", icon: "book" },
  ],
}
