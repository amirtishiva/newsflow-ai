import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HeroProps {
  trustBadge?: {
    text: string;
    icons?: React.ReactNode[];
  };
  headline: {
    line1: string;
    line2: string;
  };
  subtitle: string;
  buttons?: {
    primary?: {
      text: string;
      onClick?: () => void;
    };
    secondary?: {
      text: string;
      onClick?: () => void;
    };
  };
  className?: string;
}

const defaultShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float a=rnd(i),b=rnd(i+vec2(1,0)),c=rnd(i+vec2(0,1)),d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) { t+=a*noise(p); p*=2.*m; a*=.5; }
  return t;
}
float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a); d=a; p*=2./(i+1.);
  }
  return t;
}
void main(void) {
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    float glow=.0004/d;
    col+=vec3(glow);
    float b=noise(i+p+bg*1.731);
    col+=vec3(.002*b/length(max(p,vec2(b*p.x*.02,p.y))));
    float fade=smoothstep(0.0,1.5,d);
    col=mix(col,vec3(bg*.18),fade);
  }
  float lum=dot(col,vec3(0.299,0.587,0.114));
  col=vec3(lum)*0.6;
  col=clamp(col,0.0,1.0);
  O=vec4(col,1);
}`;

const useShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const rendererRef = useRef<any>(null);
  const pointersRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);

    // Simple WebGL renderer
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;

    const vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

    const vertices = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);

    const compile = (shader: WebGLShader, source: string) => {
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader));
      }
    };

    const setup = () => {
      const vs = gl.createShader(gl.VERTEX_SHADER)!;
      const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
      compile(vs, vertexSrc);
      compile(fs, defaultShaderSource);
      program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    };

    const resize = () => {
      const d = Math.max(1, 0.5 * window.devicePixelRatio);
      canvas.width = window.innerWidth * d;
      canvas.height = window.innerHeight * d;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = (now: number) => {
      if (!program) return;
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.uniform2f(gl.getUniformLocation(program, 'resolution'), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(program, 'time'), now * 1e-3);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameRef.current = requestAnimationFrame(render);
    };

    setup();
    resize();
    render(0);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return canvasRef;
};

const Hero: React.FC<HeroProps> = ({
  trustBadge,
  headline,
  subtitle,
  buttons,
  className = "",
}) => {
  const canvasRef = useShaderBackground();

  return (
    <div className={cn("relative w-full min-h-screen overflow-hidden", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Trust Badge */}
        {trustBadge && (
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
              {trustBadge.icons && (
                <div className="flex -space-x-1">
                  {trustBadge.icons.map((icon, index) => (
                    <span key={index} className="text-white/80">{icon}</span>
                  ))}
                </div>
              )}
              <span className="text-sm font-body text-white/90">{trustBadge.text}</span>
            </div>
          </div>
        )}

        <div className="max-w-4xl space-y-6">
          {/* Headline */}
          <h1 className="font-body tracking-tight">
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white animate-fade-in">
              {headline.line1}
            </span>
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white/80 mt-2 animate-fade-in whitespace-nowrap" style={{ animationDelay: '0.2s' }}>
              {headline.line2}
            </span>
          </h1>

          {/* Subtitle */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-lg sm:text-xl text-white/70 font-body max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* CTA Buttons */}
          {buttons && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {buttons.primary && (
                <button
                  onClick={buttons.primary.onClick}
                  className="px-8 py-3 rounded-md bg-white text-black font-body font-semibold text-base hover:bg-white/90 transition-colors"
                >
                  {buttons.primary.text}
                </button>
              )}
              {buttons.secondary && (
                <button
                  onClick={buttons.secondary.onClick}
                  className="px-8 py-3 rounded-md border border-white/30 text-white font-body font-semibold text-base hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  {buttons.secondary.text}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
