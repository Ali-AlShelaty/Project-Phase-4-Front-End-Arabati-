import React, { useId } from "react";

const themes = {
  terracotta: ["#E9D7C3", "#9C492D", "#F8EEDB", "#3B342B"],
  sage: ["#D7E0D2", "#62755B", "#F3EBD8", "#303E30"],
  rose: ["#EDDBD7", "#B97D77", "#FFF2E8", "#624641"],
  olive: ["#DEE2CB", "#72794C", "#F7F3D9", "#3C442F"],
  charcoal: ["#DBD8CF", "#454B43", "#EFE5CB", "#292F2B"],
  butter: ["#F2E6B8", "#B89B50", "#FFF7DD", "#5B4B31"],
};

export function CartArt({
  theme = "terracotta",
  name = "arabati",
  category = "Coffee",
  hero = false,
  photo,
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const [bg, accent, cream, ink] = themes[theme] || themes.terracotta;

  if (photo)
    return (
      <img
        className={`cart-art ${className}`}
        src={photo}
        alt={`${name} cart`}
      />
    );

  return (
    <svg
      className={`cart-art ${hero ? "hero-art" : ""} ${className}`}
      viewBox="0 0 640 440"
      role="img"
      aria-label={`Original illustration of ${name}, a ${category.toLowerCase()} event cart`}
    >
      <defs>
        <pattern
          id={`${uid}stripe`}
          width="46"
          height="45"
          patternUnits="userSpaceOnUse"
        >
          <rect width="46" height="45" fill={cream} />
          <rect width="23" height="45" fill={accent} />
        </pattern>

        <pattern
          id={`${uid}grain`}
          width="17"
          height="21"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="3" cy="3" r=".7" fill={ink} opacity=".07" />
          <circle cx="12" cy="14" r=".6" fill={ink} opacity=".06" />
        </pattern>

        <filter
          id={`${uid}shadow`}
          x="-30%"
          y="-30%"
          width="160%"
          height="170%"
        >
          <feDropShadow
            dx="0"
            dy="9"
            stdDeviation="7"
            floodColor="#352A20"
            floodOpacity=".12"
          />
        </filter>
      </defs>

      <rect width="640" height="440" fill={bg} />
      <circle cx="472" cy="114" r="77" fill={cream} opacity=".7" />

      <path
        d="M0 321Q147 275 311 327T640 320V440H0Z"
        fill={cream}
        opacity=".4"
      />

      <path
        d="M26 306V116a75 75 0 0 1 150 0v190"
        fill="none"
        stroke={cream}
        strokeWidth="2"
        opacity=".6"
      />

      <path
        d="M37 306V116a64 64 0 0 1 128 0v190"
        fill="none"
        stroke={cream}
        strokeWidth="2"
        opacity=".6"
      />

      <ellipse
        cx="324"
        cy="379"
        rx="207"
        ry="16"
        fill={ink}
        opacity=".1"
      />

      <g stroke={ink} strokeWidth="2" opacity=".8">
        <path
          d="M544 358q-5-69 14-132m-14 91q-36-15-36-50 32 5 39 37m4-31q-7-37 22-62 10 33-20 60m-8 68q29-19 42-50-32 5-41 33"
          fill={accent}
        />
        <path d="m526 345 5 34h39l5-34z" fill={cream} />
      </g>

      <g filter={`url(#${uid}shadow)`}>
        <path
          d="M145 183V318m337-135v135"
          stroke={ink}
          strokeWidth="6"
        />

        <path
          d="m135 143 24-51h307l26 51z"
          fill={`url(#${uid}stripe)`}
          stroke={ink}
          strokeWidth="1"
        />

        <path
          d="M135 143h357v25c-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-12 14-24 14-36 0-11 14-22 14-33 0z"
          fill={`url(#${uid}stripe)`}
        />

        <rect
          x="155"
          y="92"
          width="314"
          height="8"
          rx="3"
          fill={ink}
          opacity=".18"
        />

        <rect
          x="145"
          y="257"
          width="337"
          height="99"
          rx="7"
          fill={accent}
        />

        <path
          d="M163 270h301v67H163z"
          stroke={cream}
          fill="none"
          opacity=".45"
        />

        <rect
          x="133"
          y="247"
          width="362"
          height="13"
          rx="3"
          fill={ink}
        />

        <rect
          x="139"
          y="245"
          width="350"
          height="5"
          rx="2"
          fill={cream}
        />

        <text
          x="313"
          y="307"
          textAnchor="middle"
          fontFamily="Georgia,serif"
          fontSize={name.length > 16 ? 23 : 27}
          fill={cream}
          fontStyle="italic"
        >
          {name}
        </text>

        <text
          x="313"
          y="326"
          textAnchor="middle"
          fontFamily="Arial,sans-serif"
          fontSize="7"
          letterSpacing="3"
          fill={cream}
        >
          {category === "Coffee"
            ? "GOOD COFFEE. GOOD COMPANY."
            : category === "Food"
              ? "MADE FRESH. SHARED TOGETHER."
              : "A LITTLE SOMETHING SWEET."}
        </text>

        <circle cx="194" cy="360" r="23" fill={ink} />
        <circle cx="194" cy="360" r="12" fill={bg} />
        <circle cx="437" cy="360" r="23" fill={ink} />
        <circle cx="437" cy="360" r="12" fill={bg} />

        {category === "Coffee" ? (
          <g>
            <rect
              x="213"
              y="195"
              width="92"
              height="48"
              rx="3"
              fill={ink}
            />

            <rect
              x="216"
              y="198"
              width="85"
              height="15"
              fill="#B9B4A5"
            />

            <path
              d="M225 223h65m-55 0v11m43-11v11"
              stroke={cream}
              strokeWidth="3"
            />

            <circle cx="290" cy="205" r="3" fill={accent} />
            <path d="M232 236h15v8h-15zm37 0h15v8h-15z" fill={cream} />

            <path
              d="M334 217h24v26h-24zm24 4h7v12h-7"
              stroke={ink}
              strokeWidth="1.4"
              fill={cream}
            />

            <path
              d="M341 208c-6-7 9-10 2-19m7 19c-4-5 8-10 2-17"
              stroke={cream}
              strokeWidth="2"
              fill="none"
            />

            <path d="m385 212 3 30h21l3-30z" fill={cream} />
            <ellipse cx="398" cy="212" rx="14" ry="4" fill={ink} />
            <rect x="386" y="223" width="23" height="9" fill={accent} />
          </g>
        ) : category === "Food" ? (
          <g>
            <path d="M217 226q0-32 35-32t35 32z" fill={cream} />
            <rect
              x="217"
              y="229"
              width="70"
              height="6"
              rx="3"
              fill={ink}
            />
            <rect
              x="217"
              y="237"
              width="70"
              height="7"
              rx="3"
              fill={cream}
            />

            <path
              d="m334 208 5 35h30l5-35"
              fill={accent}
              stroke={cream}
              strokeWidth="2"
            />

            <path
              d="m341 209-4-20m12 20-1-24m10 24 3-22m5 22 6-18"
              stroke={cream}
              strokeWidth="6"
            />

            <path d="M408 219h25v25h-25z" fill={cream} />
          </g>
        ) : (
          <g>
            <path d="M231 228h51l-25 18z" fill={cream} />
            <circle cx="245" cy="217" r="15" fill="#F0C9B9" />
            <circle cx="267" cy="216" r="15" fill={cream} />
            <circle cx="256" cy="198" r="14" fill="#9C7154" />
            <path d="M337 228h55v16h-55z" fill={cream} />

            <path
              d="M340 227v-17h49v17"
              fill={accent}
              stroke={cream}
              strokeWidth="2"
            />

            <path
              d="M351 210v-11m14 11v-11m14 11v-11"
              stroke={cream}
              strokeWidth="2"
            />
          </g>
        )}

        <path
          d="M173 245v-23m-8 12c-3-10-9-16-15-15 1 10 7 16 15 15m8 1c13-2 20-8 18-18-11 1-16 8-18 18"
          fill={accent}
          stroke={ink}
          strokeWidth="1"
        />

        <path d="m160 235 3 11h20l3-11z" fill={cream} />
      </g>

      <path
        d="M77 335h36m-18-18v36m434-276h22m-11-11v22"
        stroke={ink}
        opacity=".4"
        strokeWidth="1.5"
      />

      <circle cx="92" cy="102" r="4" stroke={accent} fill="none" />
      <circle cx="518" cy="194" r="3" fill={cream} />

      <rect
        width="640"
        height="440"
        fill={`url(#${uid}grain)`}
        pointerEvents="none"
      />

      {hero && (
        <>
          <text
            x="43"
            y="413"
            fontSize="8"
            fontFamily="Arial,sans-serif"
            fill={ink}
            letterSpacing="2"
          >
            SMALL CARTS. BIG MEMORIES.
          </text>

          <text
            x="595"
            y="413"
            textAnchor="end"
            fontSize="8"
            fontFamily="Arial,sans-serif"
            fill={ink}
          >
            EST. 2026
          </text>
        </>
      )}
    </svg>
  );
}
