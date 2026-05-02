/* eslint-disable @next/next/no-img-element */

import type { HTMLAttributes } from "react";

type IconProps = HTMLAttributes<HTMLSpanElement>;

export function PickItLogo({ className, ...props }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block overflow-hidden ${className ?? ""}`}
      {...props}
    >
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        src="/votes/feed-logo.png"
      />
    </span>
  );
}

export function BellIcon({ className, ...props }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-6 w-6 ${className ?? ""}`}
      {...props}
    >
      <img
        alt=""
        className="absolute left-1/2 top-[2px] h-5 w-[17.677px] -translate-x-1/2"
        src="/votes/feed-bell.svg"
      />
    </span>
  );
}

export function PlusIcon({ className, ...props }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-6 w-6 ${className ?? ""}`}
      {...props}
    >
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-contain"
        src="/votes/feed-plus.svg"
      />
    </span>
  );
}

export function HomeIcon({
  active = false,
  className,
  ...props
}: IconProps & { active?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-6 w-6 ${className ?? ""}`}
      {...props}
    >
      <span className="absolute left-[2.076px] top-[2.076px] h-[19.848px] w-[19.848px]">
        <img alt="" className="h-full w-full max-w-none" src="/votes/feed-home-body.svg" />
      </span>
      {active ?
        <img
          alt=""
          className="absolute left-[14.946px] top-[14.936px] h-[6.98px] w-[6.98px]"
          src="/votes/feed-home-dot.svg"
        />
      : null}
    </span>
  );
}

export function ProfileIcon({ className, ...props }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-6 w-6 ${className ?? ""}`}
      {...props}
    >
      <img
        alt=""
        className="absolute left-[2.1px] top-[2.03px] h-[19.924px] w-[19.737px]"
        src="/votes/feed-profile-union.svg"
      />
      <img
        alt=""
        className="absolute left-[8.84px] top-[7.46px] h-[3.653px] w-[6.145px]"
        src="/votes/feed-profile-smile.svg"
      />
    </span>
  );
}

export function MessageCircleIcon({ className, ...props }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block overflow-hidden ${className ?? "h-6 w-6"}`}
      {...props}
    >
      <img
        alt=""
        className="absolute left-1/2 top-1/2 h-[89.58%] w-[89.58%] -translate-x-1/2 -translate-y-1/2"
        src="/votes/feed-message-circle.svg"
      />
    </span>
  );
}

export function CommentPreviewIcon({ className, ...props }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-5 w-5 overflow-hidden ${className ?? ""}`}
      {...props}
    >
      <img
        alt=""
        className="absolute left-1/2 top-[1.67px] h-[16.667px] w-[15px] -translate-x-1/2"
        src="/votes/feed-comment-preview.svg"
      />
    </span>
  );
}

export function ChevronLeftIcon({ className, ...props }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-6 w-6 ${className ?? ""}`}
      {...props}
    >
      <span className="absolute left-2 top-1.5 flex h-3.5 w-1.5 items-center justify-center">
        <span className="flex-none -rotate-90">
          <span className="relative block h-[6px] w-[14px]">
            <img
              alt=""
              className="block h-full w-full max-w-none"
              src="/votes/feed-chevron.svg"
            />
          </span>
        </span>
      </span>
    </span>
  );
}

export function ChevronRightIcon({ className, ...props }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-5 w-5 ${className ?? ""}`}
      {...props}
    >
      <span className="absolute left-[7px] top-[5px] flex h-[11.667px] w-[5px] items-center justify-center">
        <span className="flex-none rotate-90">
          <span className="relative block h-[5px] w-[11.667px]">
            <img
              alt=""
              className="block h-full w-full max-w-none"
              src="/votes/feed-chevron.svg"
            />
          </span>
        </span>
      </span>
    </span>
  );
}

export function ArrowUpIcon({ className, ...props }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-6 w-6 overflow-hidden ${className ?? ""}`}
      {...props}
    >
      <img
        alt=""
        className="absolute left-[7.25px] top-[4.75px] h-[5.086px] w-[9.5px]"
        src="/votes/scroll-arrow-head.svg"
      />
      <img
        alt=""
        className="absolute left-[11.25px] top-[8px] h-[15.5px] w-[1.5px]"
        src="/votes/scroll-arrow-stem.svg"
      />
    </span>
  );
}

export function ShoppingBagIcon({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-6 w-6 overflow-hidden ${className ?? ""}`}
      {...props}
    >
      <img
        alt=""
        className="absolute left-[7.53px] top-[2.14px] h-[6.21px] w-[8.824px]"
        src="/votes/shoppingbag-handle.svg"
      />
      <img
        alt=""
        className="absolute left-[2px] top-[7.26px] h-[14.598px] w-[19.991px]"
        src="/votes/shoppingbag-body.svg"
      />
      <img
        alt=""
        className="absolute left-[7.21px] top-[9.44px] h-[2.179px] w-[2.179px]"
        src="/votes/shoppingbag-dot.svg"
      />
      <img
        alt=""
        className="absolute left-[14.4px] top-[9.44px] h-[2.179px] w-[2.179px]"
        src="/votes/shoppingbag-dot.svg"
      />
    </span>
  );
}

export function SkipChoiceIcon({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-6 w-6 overflow-hidden ${className ?? ""}`}
      {...props}
    >
      <img
        alt=""
        className="absolute left-[3.16px] top-[2.96px] h-[10.238px] w-[17.683px] rotate-180"
        src="/votes/skip-top.svg"
      />
      <img
        alt=""
        className="absolute left-[3.16px] top-[10.64px] h-[10.238px] w-[17.683px]"
        src="/votes/skip-bottom.svg"
      />
    </span>
  );
}

export function SendArrowIcon({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-6 w-6 overflow-hidden ${className ?? ""}`}
      {...props}
    >
      <img
        alt=""
        className="absolute left-[7.25px] top-[4.75px] h-[5.086px] w-[9.5px]"
        src="/votes/submit-arrow-head.svg"
      />
      <img
        alt=""
        className="absolute left-[11.25px] top-[8px] h-[15.5px] w-[1.5px]"
        src="/votes/submit-arrow-stem.svg"
      />
    </span>
  );
}
