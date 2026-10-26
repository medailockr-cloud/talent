import { AppVisualPolish } from '../ui/AppVisualPolish.web';
import React from 'react';
import { TalentBrandStyles } from '../ui/TalentBrand.web';
import { useThemeStore } from '../../store/themeStore';

export function ShowsPolish() {
  const { theme } = useThemeStore();
  const dark = theme.isDark;

  return (
    <>
      <style>{dark ? `
.sl{background:${theme.bg}!important;color:${theme.text}!important}
.sl-head{background:${theme.bg}ee!important;backdrop-filter:blur(18px);border-bottom:1px solid ${theme.border}!important;padding:8px 16px 0}
.sl-top{height:50px}
.sl-brand-wrap{display:flex;align-items:center;gap:3px}
.sl-back{width:38px;height:44px;display:flex;align-items:center;justify-content:flex-start;color:${theme.text}!important}
.sl-wordmark{font:700 31px/1 Georgia,serif;letter-spacing:-1.5px;color:${theme.text}!important}
.sl-wordmark i{color:${theme.primary}}
.sl-head-actions{gap:4px}
.sl-icon{color:${theme.text}!important}
.sl-profile{width:34px;height:34px;border-radius:50%;overflow:hidden;border:1px solid ${theme.border}!important;margin-left:6px}
.sl-profile img{width:100%;height:100%;object-fit:cover}
.sl-heading{padding:9px 1px 14px}
.sl-heading h1{font:700 40px/1.05 Georgia,serif;letter-spacing:-1.4px;color:${theme.text}!important}
.sl-heading p{font-size:12px;color:${theme.textSecondary}!important;margin-top:7px;line-height:1.5}
.sl-head .sl-chips{padding-bottom:12px;gap:6px}
.sl-head .sl-chips button{min-height:40px;flex:1;padding:8px 9px;border:1px solid ${theme.border}!important;font-size:11px;background:${theme.surfaceBg}!important;color:${theme.textSecondary}!important}
.sl-chips button[aria-pressed=true]{background:${theme.text}!important;border-color:${theme.text}!important;color:${theme.bg}!important}
.sl-head .sl-search{margin:2px 0 12px;background:${theme.surfaceBg}!important;border:1px solid ${theme.border}!important}
.sl-search input{color:${theme.text}!important}
.sl-content{padding:16px 16px 30px}
.sl-nav{padding-bottom:4px;overflow:auto;scrollbar-width:none}
.sl-nav button{font-size:11px;min-height:42px;color:${theme.textSecondary}!important}
.sl-nav button[aria-selected=true],.sl-mini-tabs button[aria-selected=true]{border-color:${theme.primary}!important;color:${theme.text}!important}
.sl-hero{min-height:225px;border:1px solid ${theme.border}!important;border-radius:18px;margin-top:0;box-shadow:0 8px 25px rgba(0,0,0,0.5)}
.sl-hero img{object-position:72% 42%}
.sl-hero:after{background:linear-gradient(90deg,#0b1311eb 0%,#101b1466 52%,transparent 85%),linear-gradient(0deg,#07110eaa,transparent 60%)}
.sl-feature-tag{position:relative;z-index:1;display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,0.25);border-radius:20px;padding:5px 9px;margin:14px 15px 0;font-size:8px;text-transform:uppercase;letter-spacing:.8px;color:#fff;background:rgba(255,255,255,0.1);backdrop-filter:blur(10px)}
.sl-feature-copy{position:relative;z-index:1;padding:11px 15px 14px}
.sl-feature-copy h2{font:700 30px/1.05 Georgia,serif;max-width:230px;letter-spacing:-.8px;margin:0 0 7px;color:#fff!important}
.sl-feature-copy p{font-size:11px;color:#eceee8}
.sl-feature-meta{display:flex;gap:12px;margin-top:11px;align-items:center;font-size:10px;color:#eceee8}
.sl-feature-meta span{display:flex;align-items:center;gap:4px}
.sl-feature-actions{display:flex;gap:9px;margin-top:16px}
.sl-feature-actions button{border-radius:11px;min-height:40px;font-size:11px!important;padding:9px 12px!important;gap:6px}
.sl-feature-actions .sl-primary{background:#fff!important;color:#111!important;flex:1}
.sl-feature-actions .sl-secondary{background:rgba(0,0,0,0.45)!important;border:1px solid rgba(255,255,255,0.3)!important;color:#fff!important;flex:1}
.sl-demo-label{font-size:8px!important;line-height:1.5;letter-spacing:.2px;color:${theme.textMuted};margin:8px 1px 0!important}
.sl-section{margin:23px 1px 12px}
.sl-section h2{font:700 24px/1.15 Georgia,serif;letter-spacing:-.5px;color:${theme.text}!important}
.sl-section .sl-text-link{color:${theme.primary}!important;font-size:11px!important;min-height:36px}
.sl-event{border:1px solid ${theme.border}!important;background:${theme.cardBg}!important;border-radius:14px;padding:0!important;gap:12px;margin-bottom:11px;min-height:96px;overflow:hidden;align-items:stretch;box-shadow:none}
.sl-event-art{width:96px;flex-shrink:0;position:relative;overflow:hidden;background:${theme.surfaceBg}}
.sl-event-art img{width:100%;height:100%;position:absolute;inset:0;object-fit:cover}
.sl-format-badge{position:absolute;bottom:6px;left:6px;font-size:7px;letter-spacing:.5px;background:rgba(0,0,0,0.7);border:1px solid rgba(255,255,255,0.2);padding:3px 5px;border-radius:5px;color:#fff}
.sl-format-badge.online{color:${theme.primary}}
.sl-event-copy{padding:13px 0;align-self:center}
.sl-event-copy h3{font:700 17px/1.2 Georgia,serif;letter-spacing:-.2px;color:${theme.text}!important}
.sl-event-copy p{font-size:10px;margin-top:6px;line-height:1.5;display:flex;gap:5px;align-items:center;color:${theme.textSecondary}!important}
.sl-event-copy .sl-kicker{font-size:9px;text-transform:none;font-weight:400;letter-spacing:0;color:${theme.textMuted}!important;margin:5px 0}
.sl-event-price{align-self:center;margin-right:12px;font-size:10px;color:${theme.text}!important}
.sl-event-price>span{border:1px solid ${theme.border}!important;border-radius:20px;padding:7px 10px;display:flex;gap:4px;align-items:center;background:${theme.surfaceBg}!important;color:${theme.text}!important}
.sl-event-price small{font-size:9px;margin-top:6px;color:${theme.primary}!important}
.sl-host-promo{border:1px solid ${theme.border}!important;background:${theme.cardBg}!important;padding:15px;border-radius:15px;margin-top:22px;display:flex;gap:11px;align-items:center}
.sl-host-mark{width:39px;height:43px;background:${theme.surfaceBg}!important;border:1px solid ${theme.border}!important;border-radius:12px;display:flex;align-items:flex-end;justify-content:center;gap:4px;padding:10px;flex-shrink:0}
.sl-host-mark i{display:block;width:4px;background:${theme.primary};border-radius:3px;height:12px}
.sl-host-mark i:nth-child(2){height:18px}
.sl-host-mark i:nth-child(3){height:23px}
.sl-host-promo>div{flex:1;min-width:0}
.sl-host-promo h2{font:700 21px/1.15 Georgia,serif;color:${theme.text}!important}
.sl-host-promo p{font-size:10px;color:${theme.textSecondary}!important;line-height:1.6;margin-top:5px}
.sl-host-promo button{min-height:38px;font-size:10px!important;padding:8px 12px!important;margin:0;gap:5px;flex-shrink:0}
.sl-quick-links{display:flex;align-items:center;justify-content:space-between;border:1px solid ${theme.border}!important;background:${theme.cardBg}!important;border-radius:13px;margin-top:12px;padding:5px 9px;gap:4px}
.sl-quick-links button{display:flex;align-items:center;gap:6px;min-height:44px;font-size:10px;padding:0 3px;white-space:nowrap;color:${theme.text}!important}
.sl-quick-links svg{color:${theme.text}!important}
.sl-quick-links>span{height:21px;border-left:1px solid ${theme.border}!important}
.sl-primary{background:${theme.primary}!important;color:#fff!important;border-radius:12px}
.sl-secondary{background:${theme.surfaceBg}!important;border:1px solid ${theme.border}!important;color:${theme.text}!important;border-radius:12px}
.sl-text-link{color:${theme.primary}!important}
.sl-badge.pink{background:${theme.surfaceBg};color:${theme.primary};border:1px solid ${theme.border}}
.sl-badge{background:${theme.surfaceBg};color:${theme.textSecondary}}
.sl-caption,.sl-footnote{color:${theme.textSecondary}!important}
.sl-banner{border-color:${theme.border}!important;background:${theme.cardBg}!important;color:${theme.text}!important}
.sl-banner strong{color:${theme.text}!important}
.sl-banner p{color:${theme.textSecondary}!important}
.sl-banner>svg,.sl-path svg,.sl-empty>svg{color:${theme.primary}}
.sl-club-card{background:${theme.cardBg}!important;border:1px solid ${theme.border}!important;color:${theme.text}!important}
.sl-club-card h3{color:${theme.text}!important}
.sl-club-card p{color:${theme.textSecondary}!important}
.sl-overlay{background:rgba(0,0,0,0.78)}
.sl-sheet{box-shadow:0 -10px 60px rgba(0,0,0,0.7);border:1px solid ${theme.border}!important;background:${theme.cardBg}!important;color:${theme.text}!important}
.sl-sheet-top{position:sticky;top:-10px;background:${theme.cardBg}f5!important;z-index:4;padding-top:3px;border-bottom:1px solid ${theme.border}}
.sl-sheet h2,.sl-sheet h3{color:${theme.text}!important}
.sl-sheet .sl-description{color:${theme.textSecondary}!important}
.sl-sheet .sl-cover{height:175px;background:${theme.surfaceBg}}
.sl-sheet .sl-cover img{object-position:center 35%}
.sl-show-facts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0}
.sl-show-facts>div{border:1px solid ${theme.border}!important;background:${theme.surfaceBg}!important;border-radius:12px;padding:12px;font-size:11px;min-width:0}
.sl-show-facts svg{color:${theme.primary};margin-bottom:6px}
.sl-show-facts strong{display:block;font-size:12px;margin-bottom:4px;color:${theme.text}!important}
.sl-show-facts small{font-size:10px;color:${theme.textSecondary}!important;overflow-wrap:anywhere}
.sl-preview-link{display:flex;align-items:center;gap:11px;width:100%;border:1px solid ${theme.border}!important;background:${theme.surfaceBg}!important;border-radius:12px;padding:12px!important;margin-top:17px;text-align:left}
.sl-preview-link>span:first-child{width:35px;height:35px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:${theme.cardBg};color:${theme.primary};flex-shrink:0}
.sl-preview-link strong{display:block;font-size:12px;color:${theme.text}!important}
.sl-preview-link small{font-size:10px;color:${theme.textSecondary}!important;display:block;margin-top:3px;line-height:1.5}
.sl-room-lobby{border:1px solid ${theme.border}!important;border-radius:15px;text-align:center;padding:26px 17px;margin-top:18px;background:${theme.surfaceBg}!important}
.sl-room-lobby>svg{color:${theme.primary};margin-bottom:10px}
.sl-room-lobby h3{margin:0 0 7px;font-size:17px;color:${theme.text}!important}
.sl-room-lobby p{font-size:12px;color:${theme.textSecondary}!important;line-height:1.7}
.sl-room-video{max-height:320px;aspect-ratio:16/10;object-fit:contain}
.sl-online-tag{display:inline-flex;align-items:center;gap:5px;color:${theme.primary};font-size:10px;padding:5px 9px;background:${theme.surfaceBg};border:1px solid ${theme.border};border-radius:18px}
.sl-empty{background:${theme.surfaceBg}!important;border-color:${theme.border}!important}
.sl-empty strong{color:${theme.text}!important}
.sl-empty p{color:${theme.textSecondary}!important}
.sl-joined,.sl-saved{color:${theme.primary}!important}
.sl-status{color:${theme.primary};background:${theme.surfaceBg};border:1px solid ${theme.border}}
.sl-callout.pink{background:${theme.surfaceBg};border-color:${theme.border}}
.sl-callout .sl-kicker{color:${theme.primary}}
.sl-sheet .sl-meta{color:${theme.textSecondary}!important}
.sl-sheet .sl-callout{color:${theme.textSecondary}!important;background:${theme.surfaceBg}!important;border-color:${theme.border}!important}
.sl-proof-step svg,.sl-choice svg{color:${theme.primary}}
.sl-mini-count{background:${theme.surfaceBg};color:${theme.primary}}
.sl-choice[aria-pressed=true]{border-color:${theme.primary}!important;background:${theme.surfaceBg}!important}
.sl-choice[aria-pressed=true] .sl-radio{border-color:${theme.primary}}
.sl-choice{background:${theme.surfaceBg}!important;border-color:${theme.border}!important}
.sl-choice strong{color:${theme.text}!important}
.sl-choice small{color:${theme.textSecondary}!important}
.sl-check input{accent-color:${theme.primary}}
.sl-input,.sl-select,.sl-textarea{background:${theme.surfaceBg}!important;border:1px solid ${theme.border}!important;color:${theme.text}!important;color-scheme:dark}
.sl-label{color:${theme.text}!important}
.sl-overlay a{color:${theme.primary}}
.sl-selected-location{font-size:11px;color:${theme.textSecondary};margin-bottom:14px;display:flex;justify-content:space-between;align-items:center}
.sl-selected-location button{color:${theme.primary};min-height:36px}
.sl button:focus-visible,.sl-overlay button:focus-visible,.sl-overlay input:focus-visible,.sl-overlay select:focus-visible{outline:2px solid ${theme.primary};outline-offset:3px}
.sl-event-modes{display:flex;background:${theme.surfaceBg};padding:4px;gap:5px;border-radius:12px;margin:18px 0}
.sl-event-modes button{flex:1;min-height:40px;font-size:12px;border-radius:9px;color:${theme.textSecondary}}
.sl-event-modes button[aria-selected=true]{background:${theme.cardBg};color:${theme.text};box-shadow:0 2px 7px rgba(0,0,0,0.3);font-weight:700}
.sl-booking-info{margin-top:18px;font-size:12px;border-top:1px solid ${theme.border};padding-top:15px}
.sl-booking-info summary{cursor:pointer;min-height:35px;font-weight:700;color:${theme.text}}
.sl-booking-info p{color:${theme.textSecondary};line-height:1.7;font-size:11px}
.sl-event-price-note{font-size:10px!important;margin-top:4px!important;color:${theme.textSecondary}}
.sl-standing{background:${theme.surfaceBg};border:1px solid ${theme.border};padding:17px;border-radius:16px;margin-top:20px}
.sl-standing h3{margin:16px 0;font-size:17px;color:${theme.text}}
.sl-ticket{border:1px solid ${theme.border}!important;background:${theme.surfaceBg}!important;color:${theme.text}!important}
.sl-ticket-code{border-top:1px dashed ${theme.border}!important;color:${theme.text}!important}
.sl-path{border:1px solid ${theme.border}!important;background:${theme.surfaceBg}!important;color:${theme.text}!important}
.sl-path strong{color:${theme.text}!important}
.sl-path small{color:${theme.textSecondary}!important}
.sl-proof-step{border-bottom:1px solid ${theme.border}!important}
.sl-proof-step strong{color:${theme.text}!important}
.sl-proof-step small{color:${theme.textSecondary}!important}
.sl-date{background:${theme.surfaceBg}!important;color:${theme.text}!important}
.sl-date strong{color:${theme.text}!important}
.sl-date small{color:${theme.textSecondary}!important}
.sl-opp{border-bottom:1px solid ${theme.border}!important}
.sl-opp h3{color:${theme.text}!important}
.sl-opp p{color:${theme.textSecondary}!important}
.sl-opp-reward{color:${theme.text}!important}
.sl-post{border-bottom:1px solid ${theme.border}!important}
.sl-post p{color:${theme.text}!important}
.sl-post small{color:${theme.textSecondary}!important}
.sl-application{border:1px solid ${theme.border}!important;background:${theme.surfaceBg}!important}
.sl-application strong{color:${theme.text}!important}
.sl-application p{color:${theme.textSecondary}!important}
.sl-filterbar button{min-height:35px;padding:6px 11px;border:1px solid ${theme.border}!important;border-radius:18px;font-size:10px;white-space:nowrap;display:flex;align-items:center;gap:5px;background:${theme.surfaceBg}!important;color:${theme.textSecondary}!important}
.sl-filterbar button[aria-pressed=true]{color:${theme.primary}!important;border-color:${theme.primary}!important;background:${theme.surfaceBg}!important}
.sl-filterbar .sl-filter-reset{border:0!important;margin-left:auto;color:${theme.primary}!important;padding-right:0;background:none!important}
.sl-result-line{font:11px Arial;color:${theme.textSecondary}!important;display:flex;justify-content:space-between;margin:8px 0 12px}
.sl-filter-options{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 21px}
.sl-filter-options button{border:1px solid ${theme.border}!important;border-radius:12px;min-height:44px;font-size:12px;background:${theme.surfaceBg}!important;color:${theme.text}!important}
.sl-filter-options button[aria-pressed=true]{background:${theme.surfaceBg}!important;border-color:${theme.primary}!important;color:${theme.primary}!important;font-weight:700}
.sl-filter-summary{background:${theme.surfaceBg}!important;border:1px solid ${theme.border}!important;padding:14px;border-radius:12px;font-size:12px;margin:8px 0 17px}
.sl-filter-summary strong{font-size:20px;display:block;color:${theme.text}!important;margin-bottom:4px}
.sl-filter-title{font:700 13px Arial;margin-top:17px;color:${theme.text}!important}
.sl-handle{width:33px;height:4px;background:${theme.border}!important;border-radius:10px;margin:0 auto 6px}
.sl-card-access{display:flex;gap:5px;align-items:center;margin-top:6px!important;font-size:10px!important;color:${theme.primary}!important}
.sl-card-access svg{flex-shrink:0}
@media(max-width:365px){.sl-head,.sl-content{padding-left:12px;padding-right:12px}.sl-head .sl-chips button{font-size:10px;padding:7px 6px}.sl-heading h1{font-size:36px}.sl-event-art{width:77px}.sl-event{gap:9px}.sl-event-price{margin-right:8px}.sl-event-price>span{padding:6px 8px}.sl-feature-copy h2{font-size:28px}.sl-quick-links button{font-size:9px;gap:4px}.sl-host-promo{padding:12px;gap:8px}.sl-heading p{font-size:11px}.sl-level-picker button{min-width:52px;font-size:8px}}
` : `
.sl{background:#fff;color:#1c2428}.sl-head{background:#ffffffef;backdrop-filter:blur(18px);border-bottom:1px solid #f0f1f1;padding:8px 16px 0}.sl-top{height:50px}.sl-brand-wrap{display:flex;align-items:center;gap:3px}.sl-back{width:38px;height:44px;display:flex;align-items:center;justify-content:flex-start}.sl-wordmark{font:700 31px/1 Georgia,serif;letter-spacing:-1.5px}.sl-wordmark i{color:#a76880}.sl-head-actions{gap:4px}.sl-profile{width:34px;height:34px;border-radius:50%;overflow:hidden;border:1px solid #dce1df!important;margin-left:6px}.sl-profile img{width:100%;height:100%;object-fit:cover}.sl-heading{padding:9px 1px 14px}.sl-heading h1{font:700 40px/1.05 Georgia,serif;letter-spacing:-1.4px}.sl-heading p{font-size:12px;color:#68736f;margin-top:7px;line-height:1.5}.sl-head .sl-chips{padding-bottom:12px;gap:6px}.sl-head .sl-chips button{min-height:40px;flex:1;padding:8px 9px;border-color:#e0e5e2;font-size:11px;background:#fff;color:#4e5d56}.sl-chips button[aria-pressed=true]{background:#253a33!important;border-color:#253a33!important;color:#fff!important}.sl-head .sl-search{margin:2px 0 12px;background:#f5f7f5;border:1px solid #e1e7e2}.sl-content{padding:16px 16px 30px}.sl-nav{padding-bottom:4px;overflow:auto;scrollbar-width:none}.sl-nav button{font-size:11px;min-height:42px}.sl-nav button[aria-selected=true],.sl-mini-tabs button[aria-selected=true]{border-color:#3a6556;color:#244c3d}.sl-hero{min-height:225px;border:1px solid #ded9d1;border-radius:18px;margin-top:0;box-shadow:0 8px 25px #322a2010}.sl-hero img{object-position:72% 42%}.sl-hero:after{background:linear-gradient(90deg,#0b1311eb 0%,#101b1466 52%,transparent 85%),linear-gradient(0deg,#07110eaa,transparent 60%)}.sl-feature-tag{position:relative;z-index:1;display:inline-flex;align-items:center;gap:6px;border:1px solid #ffffff45;border-radius:20px;padding:5px 9px;margin:14px 15px 0;font-size:8px;text-transform:uppercase;letter-spacing:.8px;color:#fff;background:#ffffff12;backdrop-filter:blur(10px)}.sl-feature-tag svg{color:#f2dcc1}.sl-feature-copy{position:relative;z-index:1;padding:11px 15px 14px}.sl-feature-copy h2{font:700 30px/1.05 Georgia,serif;max-width:230px;letter-spacing:-.8px;margin:0 0 7px}.sl-feature-copy p{font-size:11px;color:#eceee8}.sl-feature-meta{display:flex;gap:12px;margin-top:11px;align-items:center;font-size:10px}.sl-feature-meta span{display:flex;align-items:center;gap:4px}.sl-feature-actions{display:flex;gap:9px;margin-top:16px}.sl-feature-actions button{border-radius:11px;min-height:40px;font-size:11px!important;padding:9px 12px!important;gap:6px}.sl-feature-actions .sl-primary{background:#fff!important;color:#1c2823!important;flex:1}.sl-feature-actions .sl-secondary{background:#18231b77!important;border:1px solid #ffffff90!important;color:white!important;flex:1}.sl-demo-label{font-size:8px!important;line-height:1.5;letter-spacing:.2px;color:#6c7671;margin:8px 1px 0!important}.sl-section{margin:23px 1px 12px}.sl-section h2{font:700 24px/1.15 Georgia,serif;letter-spacing:-.5px}.sl-section .sl-text-link{color:#52665b!important;font-size:11px!important;min-height:36px}.sl-event{border:1px solid #e6eae7!important;background:#fff!important;border-radius:14px;padding:0!important;gap:12px;margin-bottom:11px;min-height:96px;overflow:hidden;align-items:stretch;box-shadow:0 3px 13px #223a2b04}.sl-event-art{width:96px;flex-shrink:0;position:relative;overflow:hidden;background:#e8eeea}.sl-event-art img{width:100%;height:100%;position:absolute;inset:0;object-fit:cover}.sl-format-badge{position:absolute;bottom:6px;left:6px;font-size:7px;letter-spacing:.5px;background:#fffefbfa;border:1px solid #ffffffb0;padding:3px 5px;border-radius:5px;color:#283d32}.sl-format-badge.online{color:#355c63}.sl-event-copy{padding:13px 0;align-self:center}.sl-event-copy h3{font:700 17px/1.2 Georgia,serif;letter-spacing:-.2px}.sl-event-copy p{font-size:10px;margin-top:6px;line-height:1.5;display:flex;gap:5px;align-items:center;color:#66756c}.sl-event-copy .sl-kicker{font-size:9px;text-transform:none;font-weight:400;letter-spacing:0;color:#637068;margin:5px 0}.sl-event-price{align-self:center;margin-right:12px;font-size:10px;color:#364c3f}.sl-event-price>span{border:1px solid #dce4de;border-radius:20px;padding:7px 10px;display:flex;gap:4px;align-items:center;background:#f9fbf9}.sl-event-price small{font-size:9px;margin-top:6px;color:#55665b}.sl-host-promo{border:1px solid #dce6df;background:#f4f7f3;padding:15px;border-radius:15px;margin-top:22px;display:flex;gap:11px;align-items:center}.sl-host-mark{width:39px;height:43px;background:#e9f0e7;border:1px solid #d5e2d5;border-radius:12px;display:flex;align-items:flex-end;justify-content:center;gap:4px;padding:10px;flex-shrink:0}.sl-host-mark i{display:block;width:4px;background:#56735a;border-radius:3px;height:12px}.sl-host-mark i:nth-child(2){height:18px}.sl-host-mark i:nth-child(3){height:23px}.sl-host-promo>div{flex:1;min-width:0}.sl-host-promo h2{font:700 21px/1.15 Georgia,serif}.sl-host-promo p{font-size:10px;color:#627062;line-height:1.6;margin-top:5px}.sl-host-promo button{min-height:38px;font-size:10px!important;padding:8px 12px!important;margin:0;gap:5px;flex-shrink:0}.sl-quick-links{display:flex;align-items:center;justify-content:space-between;border:1px solid #e5e9e6;border-radius:13px;margin-top:12px;padding:5px 9px;gap:4px}.sl-quick-links button{display:flex;align-items:center;gap:6px;min-height:44px;font-size:10px;padding:0 3px;white-space:nowrap}.sl-quick-links svg{color:#546b5e}.sl-quick-links>span{height:21px;border-left:1px solid #e0e6e1}.sl-primary{background:#253a33!important;color:#fff!important;border-radius:12px}.sl-secondary{background:#f6f8f6!important;border-color:#dbe3dc!important;border-radius:12px}.sl-text-link{color:#315f4c!important}.sl-badge.pink{background:#edf3ee;color:#365c46;border:1px solid #dbe7dd}.sl-badge{background:#edf2ee;color:#364e3d}.sl-caption,.sl-footnote{color:#637066}.sl-banner{border-color:#e2e8e2;background:#fff}.sl-banner>svg,.sl-path svg,.sl-empty>svg{color:#4f705c}.sl-club-card{background:#fbfcfa;border-color:#e1e6e0!important}.sl-overlay{background:#14251e66}.sl-sheet{box-shadow:0 -10px 60px #1c3d2722;border:1px solid #e1e7e0;background:#fff}.sl-sheet-top{position:sticky;top:-10px;background:#fffffff2;z-index:4;padding-top:3px}.sl-sheet .sl-description{color:#536359}.sl-sheet .sl-cover{height:175px}.sl-sheet .sl-cover img{object-position:center 35%}.sl-show-facts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:18px 0}.sl-show-facts>div{border:1px solid #e1e7e1;background:#f8faf7;border-radius:12px;padding:12px;font-size:11px;min-width:0}.sl-show-facts svg{color:#54715b;margin-bottom:6px}.sl-show-facts strong{display:block;font-size:12px;margin-bottom:4px}.sl-show-facts small{font-size:10px;color:#627368;overflow-wrap:anywhere}.sl-preview-link{display:flex;align-items:center;gap:11px;width:100%;border:1px solid #e2e8e2!important;background:#fff!important;border-radius:12px;padding:12px!important;margin-top:17px;text-align:left}.sl-preview-link>span:first-child{width:35px;height:35px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#ecf3ed;color:#4e7058;flex-shrink:0}.sl-preview-link strong{display:block;font-size:12px}.sl-preview-link small{font-size:10px;color:#627368;display:block;margin-top:3px;line-height:1.5}.sl-room-lobby{border:1px solid #dae5db;border-radius:15px;text-align:center;padding:26px 17px;margin-top:18px;background:radial-gradient(ellipse at top,#e8f1e5,transparent 80%),#f8faf6}.sl-room-lobby>svg{color:#55745b;margin-bottom:10px}.sl-room-lobby h3{margin:0 0 7px;font-size:17px}.sl-room-lobby p{font-size:12px;color:#5b6f60;line-height:1.7}.sl-room-video{max-height:320px;aspect-ratio:16/10;object-fit:contain}.sl-online-tag{display:inline-flex;align-items:center;gap:5px;color:#426870;font-size:10px;padding:5px 9px;background:#edf3f3;border:1px solid #d8e4e6;border-radius:18px}.sl-empty{background:#f9fbf8}.sl-joined,.sl-saved{color:#385f45!important}.sl-status{color:#365b43;background:#edf4ec}.sl-callout.pink{background:#f1f6ef;border-color:#dce7d9}.sl-callout .sl-kicker{color:#496d51}.sl-sheet .sl-meta{color:#607166}.sl-sheet .sl-callout{color:#435d4c}.sl-proof-step svg,.sl-choice svg{color:#4f7359}.sl-mini-count{background:#eef4ec;color:#48654c}.sl-choice[aria-pressed=true]{border-color:#64856a!important;background:#f0f6ed!important}.sl-choice[aria-pressed=true] .sl-radio{border-color:#5a7d62}.sl-check input{accent-color:#456d50}.sl-input,.sl-select,.sl-textarea{color-scheme:light}.sl-overlay a{color:#346149}.sl-selected-location{font-size:11px;color:#5a6e60;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center}.sl-selected-location button{color:#315f48;min-height:36px}.sl button:focus-visible,.sl-overlay button:focus-visible,.sl-overlay input:focus-visible,.sl-overlay select:focus-visible{outline:2px solid #386047;outline-offset:3px}.sl-event-modes{display:flex;background:#f2f5f0;padding:4px;gap:5px;border-radius:12px;margin:18px 0}.sl-event-modes button{flex:1;min-height:40px;font-size:12px;border-radius:9px;color:#647263}.sl-event-modes button[aria-selected=true]{background:#fff;color:#263e2c;box-shadow:0 2px 7px #263e2c0c;font-weight:700}.sl-booking-info{margin-top:18px;font-size:12px;border-top:1px solid #e1e7e1;padding-top:15px}.sl-booking-info summary{cursor:pointer;min-height:35px;font-weight:700;color:#3f5747}.sl-booking-info p{color:#657468;line-height:1.7;font-size:11px}.sl-event-price-note{font-size:10px!important;margin-top:4px!important;color:#637569}.sl-standing{background:#f4f7f0;border:1px solid #e1e7db;padding:17px;border-radius:16px;margin-top:20px}.sl-standing h3{margin:16px 0;font-size:17px}.sl-ticket{border:1px solid #e2e8e2;border-radius:16px;padding:20px;margin-top:16px}.sl-ticket-code{border-top:1px dashed #e2e8e2;padding-top:15px;margin-top:17px;font-family:monospace;letter-spacing:1px;font-size:13px}.sl-path{border:1px solid #e6eae7!important;border-radius:13px;padding:14px!important;text-align:left;display:flex;align-items:center;gap:11px;min-width:0}.sl-path strong{font-size:12px;display:block}.sl-path small{color:#627062;font-size:10px;display:block;margin-top:2px}.sl-proof-step{display:flex;align-items:center;gap:13px;padding:16px 0;border-bottom:1px solid #e6eae7}.sl-proof-step strong{font-size:12px;display:block}.sl-proof-step small{color:#627062;font-size:11px}.sl-date{background:#f8faf7;border-radius:11px;min-width:49px;width:49px;padding:8px 0;text-align:center;flex-shrink:0;line-height:1.2}.sl-date strong{font-size:21px;display:block;letter-spacing:-1px}.sl-date small{display:block;font-size:9px;color:#627062;margin-top:3px;text-transform:uppercase}.sl-opp{padding:19px 0;border-bottom:1px solid #e6eae7}.sl-opp h3{font-size:17px;letter-spacing:-.4px;line-height:1.3;margin:8px 0}.sl-opp p{font-size:11px;color:#627062}.sl-opp-reward{font-size:11px;font-weight:700;margin-top:12px}.sl-post{border-bottom:1px solid #e6eae7;padding:17px 0}.sl-post p{font-size:13px;white-space:pre-wrap;overflow-wrap:anywhere}.sl-post small{color:#627062;font-size:10px}.sl-application{border:1px solid #e6eae7;padding:15px;border-radius:13px;margin-top:10px}.sl-application strong{font-size:13px}.sl-application p{font-size:11px;color:#627062;margin-top:5px}.sl-filterbar{display:flex;align-items:center;gap:8px;padding:0 0 13px;overflow:auto;scrollbar-width:none}.sl-filterbar button{min-height:35px;padding:6px 11px;border:1px solid #e5e5eb;border-radius:18px;font-size:10px;white-space:nowrap;display:flex;align-items:center;gap:5px;color:#6e6f79}.sl-filterbar button[aria-pressed=true]{color:#365c46;border-color:#365c46;background:#edf3ee}.sl-filterbar .sl-filter-reset{border:0;margin-left:auto;color:#365c46;padding-right:0}.sl-result-line{font:11px Arial;color:#777883;display:flex;justify-content:space-between;margin:8px 0 12px}.sl-filter-options{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 21px}.sl-filter-options button{border:1px solid #e4e4eb;border-radius:12px;min-height:44px;font-size:12px;background:#f8f8fa}.sl-filter-options button[aria-pressed=true]{background:#edf3ee;border-color:#365c46;color:#365c46;font-weight:700}.sl-filter-summary{background:#f8f8fa;border:1px solid #e7e7ed;padding:14px;border-radius:12px;font-size:12px;margin:8px 0 17px}.sl-filter-summary strong{font-size:20px;display:block;color:#141519;margin-bottom:4px}
@media(max-width:365px){.sl-head,.sl-content{padding-left:12px;padding-right:12px}.sl-head .sl-chips button{font-size:10px;padding:7px 6px}.sl-heading h1{font-size:36px}.sl-event-art{width:77px}.sl-event{gap:9px}.sl-event-price{margin-right:8px}.sl-event-price>span{padding:6px 8px}.sl-feature-copy h2{font-size:28px}.sl-quick-links button{font-size:9px;gap:4px}.sl-host-promo{padding:12px;gap:8px}.sl-heading p{font-size:11px}.sl-level-picker button{min-width:52px;font-size:8px}}
`}
      </style>
      <TalentBrandStyles />
      <AppVisualPolish />
    </>
  );
}
