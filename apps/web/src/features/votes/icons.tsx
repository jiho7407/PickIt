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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
        <path d="M8 8L11.2929 4.70711C11.6834 4.31658 12.3166 4.31658 12.7071 4.70711L16 8" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 5L12 19" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </span>
  );
}

export function BuyButtonIcon({ className, ...props }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-6 w-6 overflow-hidden ${className ?? ""}`}
      {...props}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
        <path d="M11.8918 2.13672C14.1262 2.13672 15.2614 3.6347 15.7983 4.95406C16.0664 5.6127 16.2046 6.26105 16.2766 6.73775C16.313 6.978 16.3331 7.17948 16.3443 7.32309C16.3499 7.395 16.3534 7.45275 16.3554 7.49394C16.3564 7.51452 16.3571 7.531 16.3575 7.5431C16.3577 7.54915 16.3578 7.55417 16.3579 7.55799C16.358 7.55989 16.3581 7.56155 16.3581 7.56288V7.56544C16.3576 7.56576 16.3384 7.56646 15.5958 7.58373L16.3581 7.56607C16.3679 7.98709 16.0344 8.33631 15.6134 8.3461C15.1929 8.35585 14.8439 8.02324 14.8334 7.60288V7.60267C14.8334 7.60196 14.8333 7.60011 14.8332 7.59735C14.833 7.59172 14.8326 7.58199 14.8319 7.56842C14.8306 7.541 14.8282 7.49799 14.8238 7.44181C14.815 7.32925 14.7986 7.16472 14.7685 6.96584C14.7078 6.56422 14.5941 6.04141 14.3855 5.52898C13.9692 4.50613 13.2524 3.66188 11.8918 3.66188C11.1755 3.66188 10.6792 3.88923 10.3134 4.20701C9.93268 4.5378 9.65508 5.00134 9.45808 5.51472C9.26209 6.0255 9.16069 6.5472 9.10935 6.9486C9.08394 7.14727 9.07147 7.31166 9.0653 7.42415C9.06223 7.48024 9.06068 7.52313 9.05998 7.55054C9.05963 7.5642 9.05941 7.57407 9.05934 7.57969V7.58522L9.05828 7.62289C9.0379 8.02585 8.70479 8.34632 8.29676 8.34632C7.8756 8.34632 7.53418 8.0049 7.53418 7.58373H8.29676C7.53418 7.58373 7.53418 7.58342 7.53418 7.5831V7.57565C7.5342 7.57183 7.53432 7.56679 7.53439 7.56076C7.53454 7.54866 7.53472 7.53216 7.53524 7.5116C7.5363 7.4704 7.53832 7.41266 7.54227 7.34075C7.55014 7.19708 7.56577 6.99543 7.59652 6.75498C7.65753 6.27806 7.78083 5.62861 8.0342 4.96832C8.28657 4.31062 8.68309 3.60301 9.3134 3.05548C9.95868 2.49496 10.8106 2.13672 11.8918 2.13672Z" fill="#32CFC6"/>
        <path d="M2.04527 19.262L4.10066 8.66885C4.25964 7.84948 4.97715 7.25781 5.81179 7.25781H18.1887C19.0234 7.25781 19.7409 7.84948 19.8999 8.66885L21.9553 19.262C22.2162 20.6067 21.1862 21.8558 19.8163 21.8558H4.18419C2.81436 21.8558 1.78435 20.6067 2.04527 19.262Z" fill="#32CFC6"/>
        <circle cx="8.29643" cy="10.5269" r="1.0894" fill="white"/>
        <circle cx="15.4869" cy="10.5269" r="1.0894" fill="white"/>
      </svg>
    </span>
  );
}

export function SkipButtonIcon({ className, ...props }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block h-6 w-6 overflow-hidden ${className ?? ""}`}
      {...props}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
        <path d="M12.1504 13.2002C10.7246 13.2002 9.46715 12.5393 8.54235 11.891C7.57689 11.2142 6.69904 10.3554 5.98352 9.56485C5.25884 8.76414 4.6466 7.97283 4.21811 7.38683C4.00253 7.092 3.83013 6.84466 3.70984 6.66817C3.64967 6.57988 3.60239 6.50895 3.56897 6.45845C3.55227 6.43321 3.53885 6.413 3.52921 6.39824C3.5244 6.39086 3.52062 6.38469 3.51762 6.38007C3.51613 6.37776 3.5148 6.37576 3.51376 6.37416C3.51326 6.37339 3.51279 6.37272 3.5124 6.37211C3.5122 6.3718 3.51182 6.37136 3.51172 6.3712C3.51169 6.3707 3.53043 6.35826 5.23828 5.25788L3.51126 6.37052C2.85012 5.34436 3.14605 3.97639 4.17221 3.31525C5.19783 2.65445 6.56481 2.94977 7.22636 3.97461C7.22624 3.97442 7.22628 3.97459 7.22658 3.97506C7.2267 3.97524 7.22686 3.97547 7.22704 3.97574L7.22704 3.97551C7.22719 3.97574 7.22735 3.97619 7.22749 3.97642C7.22829 3.97766 7.22955 3.97945 7.23113 3.98188C7.23585 3.98911 7.244 4.00162 7.25544 4.01891C7.27839 4.05359 7.31453 4.10776 7.36268 4.17841C7.45918 4.31999 7.60331 4.52713 7.78643 4.77756C8.15539 5.28215 8.66965 5.94501 9.26101 6.59841C9.86155 7.26196 10.4895 7.8573 11.0798 8.27113C11.7108 8.71346 12.0595 8.77962 12.1504 8.77962C12.2298 8.77962 12.5528 8.72258 13.1426 8.29362C13.6975 7.89004 14.2853 7.30518 14.8472 6.64681C15.3998 5.99926 15.8762 5.34136 16.217 4.83982C16.3861 4.59107 16.5185 4.38551 16.6069 4.24521C16.651 4.17519 16.684 4.12165 16.7048 4.08753C16.7152 4.07056 16.7224 4.05838 16.7266 4.0514C16.7287 4.04791 16.73 4.04565 16.7305 4.04481C16.7307 4.04442 16.7309 4.04437 16.7307 4.04459C16.7307 4.04472 16.7305 4.04496 16.7303 4.04527L16.73 4.04572C17.3526 2.99615 18.7082 2.64963 19.7581 3.27185C20.8082 3.89422 21.155 5.25018 20.5326 6.30032L18.6311 5.17336C20.5057 6.28431 20.532 6.30038 20.5322 6.301C20.5321 6.30116 20.5317 6.30158 20.5315 6.30191C20.5311 6.30256 20.5306 6.30334 20.5301 6.30418L20.5156 6.32872C20.5065 6.34375 20.4941 6.36429 20.4785 6.38984C20.4474 6.44091 20.4032 6.51241 20.3472 6.60137C20.2352 6.77915 20.0747 7.02807 19.8733 7.32457C19.473 7.91361 18.898 8.70989 18.2096 9.51646C17.5305 10.3122 16.6874 11.1815 15.7428 11.8685C14.8332 12.5301 13.5878 13.2002 12.1504 13.2002ZM7.22636 3.97461L7.22681 3.97506L7.22704 3.97551C7.22683 3.9752 7.22656 3.97492 7.22636 3.97461Z" fill="#FF6842"/>
        <path d="M11.8496 10.6406C13.2754 10.6406 14.5328 11.3015 15.4577 11.9498C16.4231 12.6266 17.301 13.4854 18.0165 14.276C18.7412 15.0767 19.3534 15.868 19.7819 16.454C19.9975 16.7488 20.1699 16.9962 20.2902 17.1727C20.3503 17.2609 20.3976 17.3319 20.431 17.3824C20.4477 17.4076 20.4612 17.4278 20.4708 17.4426C20.4756 17.45 20.4794 17.4561 20.4824 17.4608C20.4839 17.4631 20.4852 17.4651 20.4862 17.4667C20.4867 17.4674 20.4872 17.4681 20.4876 17.4687C20.4878 17.469 20.4882 17.4695 20.4883 17.4696C20.4883 17.4701 20.4696 17.4826 18.7617 18.5829L20.4883 17.4696C21.1494 18.4958 20.8539 19.8644 19.8278 20.5256C18.8022 21.1864 17.4352 20.8911 16.7736 19.8662C16.7738 19.8664 16.7739 19.8667 16.7736 19.8662C16.7735 19.866 16.7731 19.8653 16.773 19.8651C16.7728 19.8648 16.7731 19.8653 16.773 19.8651C16.7722 19.8638 16.7705 19.8614 16.7689 19.8589C16.7642 19.8517 16.756 19.8392 16.7446 19.8219C16.7216 19.7872 16.6855 19.7331 16.6373 19.6624C16.5408 19.5208 16.3967 19.3137 16.2136 19.0633C15.8446 18.5587 15.3303 17.8958 14.739 17.2424C14.1384 16.5789 13.5105 15.9835 12.9202 15.5697C12.2892 15.1274 11.9405 15.0612 11.8496 15.0612C11.7702 15.0612 11.4472 15.1182 10.8574 15.5472C10.3025 15.9508 9.7147 16.5356 9.15283 17.194C8.60021 17.8416 8.12383 18.4995 7.78299 19.001C7.61395 19.2498 7.48148 19.4553 7.3931 19.5956C7.34899 19.6656 7.31599 19.7192 7.29517 19.7533C7.28482 19.7703 7.27755 19.7824 7.27336 19.7894C7.27126 19.7929 7.27 19.7952 7.2695 19.796L7.26995 19.7951C6.6474 20.8447 5.29184 21.1912 4.24194 20.569C3.19182 19.9466 2.84503 18.5906 3.46739 17.5405L5.3689 18.6675C3.49434 17.5565 3.46753 17.5411 3.46739 17.5405C3.46748 17.5403 3.46833 17.5392 3.46852 17.5389C3.46891 17.5383 3.46939 17.5375 3.46989 17.5366L3.48443 17.5121C3.49346 17.4971 3.50588 17.4765 3.52146 17.451C3.55262 17.3999 3.59675 17.3284 3.65279 17.2395C3.76477 17.0617 3.92525 16.8127 4.12675 16.5162C4.52704 15.9272 5.10204 15.1309 5.79037 14.3244C6.46948 13.5286 7.31255 12.6593 8.25718 11.9723C9.16682 11.3107 10.4122 10.6406 11.8496 10.6406Z" fill="#FF6842"/>
      </svg>
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
