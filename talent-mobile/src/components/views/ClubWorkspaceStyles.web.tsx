import React from 'react';
import { useThemeStore } from '../../store/themeStore';

export function ClubWorkspaceStyles() {
  const { theme } = useThemeStore();
  const dark = theme.isDark;

  return (
    <style>{dark ? `
.cw{height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;background:${theme.bg}!important;color:${theme.text}!important;font:13px/1.5 Arial,Helvetica,sans-serif}.cw *,.cw-dialog *{box-sizing:border-box}.cw button,.cw-dialog button{border:0;background:none;font:inherit;color:inherit;cursor:pointer}
.cw-head{position:sticky;top:0;z-index:4;padding:8px 16px 0;border-bottom:1px solid ${theme.border}!important;background:${theme.bg}f7!important;backdrop-filter:blur(12px)}
.cw-top,.cw-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.cw-top{height:44px}.cw-top>div{display:flex;align-items:center;gap:5px}
.cw-wordmark{font:800 30px Arial;letter-spacing:-1.8px;color:${theme.text}!important}.cw-wordmark b{color:${theme.primary}!important}
.cw-icon{width:40px;height:42px;display:inline-flex;align-items:center;justify-content:center;color:${theme.text}!important}
.cw h1{font-size:27px;letter-spacing:-.7px;margin:12px 0 4px;color:${theme.text}!important}
.cw-lead{font-size:12px;color:${theme.textSecondary}!important;margin:0 0 14px}
.cw-search{display:flex;align-items:center;gap:8px;padding:0 12px;background:${theme.surfaceBg}!important;border:1px solid ${theme.border}!important;border-radius:12px}
.cw-search input{width:100%;min-width:0;background:none;border:0;outline:none;height:42px;font:12px Arial;color:${theme.text}!important}
.cw-tabs,.cw-section-tabs{display:flex;gap:23px;border-bottom:1px solid ${theme.border}!important}
.cw-tabs button,.cw-section-tabs button{min-height:45px;border-bottom:2px solid transparent;color:${theme.textSecondary}!important;font-size:12px;font-weight:600}
.cw-tabs button[aria-selected=true],.cw-section-tabs button[aria-selected=true]{border-color:${theme.primary}!important;color:${theme.text}!important}
.cw-content{padding:17px 16px 25px}
.cw-chips{display:flex;gap:7px;overflow:auto;scrollbar-width:none;margin-bottom:17px}
.cw-chips button{min-height:36px;white-space:nowrap;padding:8px 12px;border:1px solid ${theme.border}!important;border-radius:20px;color:${theme.textSecondary}!important;font-size:11px;background:${theme.surfaceBg}!important}
.cw-chips button[aria-pressed=true]{background:${theme.text}!important;color:${theme.bg}!important;border-color:${theme.text}!important}
.cw-heading{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:19px 0 12px}
.cw-heading h2{font-size:17px;letter-spacing:-.3px;margin:0;color:${theme.text}!important}
.cw-heading small,.cw-subtle{font-size:10px;color:${theme.textMuted}!important}
.cw-link{color:${theme.primary}!important;font-size:11px!important;min-height:36px;display:inline-flex;align-items:center;gap:5px}
.cw-feature{background:${theme.cardBg}!important;border:1px solid ${theme.border}!important;border-radius:16px;padding:17px;color:${theme.text}!important}
.cw-feature small{color:${theme.primaryLight || '#f0a6cb'}!important;letter-spacing:1px;font-size:9px}
.cw-feature h3{font-size:18px;letter-spacing:-.4px;margin:9px 0;font-weight:700;color:${theme.text}!important}
.cw-feature p{font-size:11px;color:${theme.textSecondary}!important;line-height:1.8}
.cw-feature .cw-link{color:${theme.primary}!important}
.cw-exchange-logos{display:flex;align-items:center;gap:9px;margin:13px 0}
.cw-mine-tray{display:flex;gap:13px;overflow:auto;margin-bottom:19px;padding-bottom:4px}
.cw-mine-tray button{width:67px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:9px;color:${theme.textSecondary}!important}
.cw-mine-tray button>span:last-child{max-width:67px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
.cw-card{border:1px solid ${theme.border}!important;border-radius:16px;overflow:hidden;margin-bottom:16px;background:${theme.cardBg}!important;color:${theme.text}!important}
.cw-card-main{display:block;width:100%;padding:0!important;text-align:left;color:inherit}
.cw-cover{height:120px;background:${theme.surfaceBg}!important;position:relative;overflow:hidden}
.cw-cover img{width:100%;height:100%;object-fit:cover;opacity:.82}
.cw-cover:after{content:'';position:absolute;inset:0;background:linear-gradient(transparent,rgba(0,0,0,0.6))}
.cw-cover-label{position:absolute;z-index:1;right:11px;top:10px;font-size:9px;color:#fff;background:rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:4px 8px}
.cw-card-body{position:relative;padding:16px 14px 13px;color:${theme.text}!important}
.cw-card-body>.cw-avatar{position:absolute;top:-28px}
.cw-card-label{font-size:9px;color:${theme.textMuted}!important;text-align:right;min-height:20px}
.cw-card h3{font-size:17px;font-weight:700;line-height:1.3;letter-spacing:-.3px;margin:7px 0 5px;color:${theme.text}!important}
.cw-card p{font-size:11px;color:${theme.textSecondary}!important;line-height:1.7;margin:0 0 8px}
.cw-card-bottom{display:flex;justify-content:space-between;gap:8px;align-items:center;border-top:1px solid ${theme.border}!important;padding:10px 14px}
.cw-status{display:inline-flex;align-items:center;gap:4px;color:${theme.primary}!important;background:${theme.surfaceBg}!important;border:1px solid ${theme.border}!important;border-radius:15px;padding:4px 8px;font-size:10px}
.cw-primary{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px;background:${theme.primary}!important;color:white!important;font-size:12px!important;font-weight:700!important;border-radius:23px;padding:11px 17px!important}
.cw-primary:disabled{opacity:.4;cursor:default}
.cw-secondary{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:42px;border:1px solid ${theme.border}!important;background:${theme.surfaceBg}!important;color:${theme.text}!important;border-radius:12px;padding:10px 14px!important;font-size:12px!important}
.cw-actions{display:flex;gap:8px;flex-wrap:wrap}
.cw-actions>.cw-primary{flex:1}
.cw-empty{padding:24px 17px;text-align:center;border:1px dashed ${theme.border}!important;border-radius:15px;background:${theme.surfaceBg}!important;margin:15px 0}
.cw-empty h3{font-size:15px;color:${theme.text}!important}
.cw-empty p,.cw-intro{font-size:12px;line-height:1.8;color:${theme.textSecondary}!important}
.cw-note{font:10px/1.8 Arial;color:${theme.textMuted}!important;margin:17px 0}
.cw-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.8)!important;z-index:10060;display:flex;justify-content:center}
.cw-dialog{width:100%;max-width:430px;height:100dvh;overflow:auto;scrollbar-width:none;background:${theme.bg}!important;color:${theme.text}!important;font:13px/1.5 Arial,Helvetica,sans-serif;outline:none}
.cw-dialog-head{position:sticky;top:0;z-index:5;background:${theme.bg}f5!important;backdrop-filter:blur(12px);border-bottom:1px solid ${theme.border}!important;display:flex;align-items:center;justify-content:space-between;padding:5px 12px;height:53px;color:${theme.text}!important}
.cw-dialog-head strong{font-size:12px;color:${theme.text}!important}
.cw-detail-cover{height:155px;background:${theme.surfaceBg}!important}
.cw-detail-cover>img{width:100%;height:100%;object-fit:cover}
.cw-detail-body{padding:0 18px 22px}
.cw-identity{position:relative;display:flex;justify-content:space-between;align-items:flex-end;margin-top:-30px}
.cw-detail-body h2{font-size:24px;letter-spacing:-.6px;line-height:1.2;margin:15px 0 8px;color:${theme.text}!important}
.cw-meta{font-size:11px;color:${theme.textSecondary}!important;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.cw-section-tabs{justify-content:space-between;gap:8px;margin-top:19px}
.cw-section-tabs button{font-size:11px}
.cw-activity{padding:15px;border:1px solid ${theme.border}!important;border-radius:14px;margin-top:13px;background:${theme.cardBg}!important;color:${theme.text}!important}
.cw-activity-top{display:flex;justify-content:space-between;gap:7px;color:${theme.textSecondary}!important;font-size:9px}
.cw-activity h3{font-size:15px;line-height:1.4;margin:10px 0 6px;color:${theme.text}!important}
.cw-activity p{font-size:11px;color:${theme.textSecondary}!important;line-height:1.8;margin:8px 0;white-space:pre-wrap}
.cw-person{display:flex;align-items:center;gap:10px;padding:14px 0;border-bottom:1px solid ${theme.border}!important}
.cw-person>span:nth-child(2){flex:1}
.cw-person strong{display:block;font-size:12px;color:${theme.text}!important}
.cw-person small{display:block;font-size:10px;color:${theme.textSecondary}!important}
.cw-person-bubble{height:34px;width:34px;display:flex;align-items:center;justify-content:center;background:${theme.surfaceBg}!important;color:${theme.text}!important;border-radius:50%;font-weight:700;font-size:11px}
.cw-form{padding:19px}
.cw-form h2{font-size:25px;letter-spacing:-.6px;margin:4px 0 9px;color:${theme.text}!important}
.cw-form>p{font-size:12px;line-height:1.8;color:${theme.textSecondary}!important}
.cw-field{display:block;font-size:11px;font-weight:600;margin:17px 0 7px;color:${theme.text}!important}
.cw-input{display:block;width:100%;border:1px solid ${theme.border}!important;border-radius:11px;background:${theme.surfaceBg}!important;color:${theme.text}!important;padding:11px;font:12px Arial;min-height:43px;color-scheme:dark}
.cw-form textarea{min-height:95px;resize:vertical}
.cw-check{display:flex;gap:9px;align-items:flex-start;font-size:11px;color:${theme.textSecondary}!important;line-height:1.8;margin:16px 0}
.cw-check input{accent-color:${theme.primary};margin-top:4px}
.cw-callout{border:1px solid ${theme.border}!important;background:${theme.surfaceBg}!important;border-radius:13px;padding:14px;margin:15px 0;font-size:12px;color:${theme.text}!important;line-height:1.8}
.cw-error{font-size:12px;color:${theme.primary}!important;background:${theme.surfaceBg}!important;border:1px solid ${theme.border}!important;padding:11px;border-radius:10px;margin:14px 0}
.cw-upload{border:1px dashed ${theme.border}!important;border-radius:12px;padding:13px;margin-top:8px;display:flex;align-items:center;gap:12px}
.cw-upload label{font-size:11px;color:${theme.primary}!important}
.cw-upload input{font-size:10px;max-width:220px;display:block;margin-top:8px;color:${theme.text}!important}
.cw-upload small{font-size:9px;color:${theme.textSecondary}!important;display:block}
.cw-post{padding:16px 0;border-bottom:1px solid ${theme.border}!important}
.cw-post p{font-size:12px;color:${theme.text}!important;line-height:1.8;white-space:pre-wrap}
.cw-post strong{font-size:12px;color:${theme.text}!important}
.cw-profile{font:12px/1.5 Arial;margin:0 20px 23px;padding:17px;border:1px solid ${theme.border}!important;border-radius:16px;color:${theme.text}!important;background:${theme.cardBg}!important}
.cw-profile-title{display:flex;justify-content:space-between;align-items:center;gap:8px}
.cw-profile-title h3{font-size:16px;margin:0;color:${theme.text}!important}
.cw-profile h4{font-size:10px;color:${theme.textSecondary}!important;letter-spacing:.6px;text-transform:uppercase;margin:17px 0 7px}
.cw-profile-row{display:flex;gap:9px;align-items:center;margin-top:10px}
.cw-profile-row>button:first-child{flex:1;display:flex;gap:10px;align-items:center;min-width:0;background:none;border:0;padding:0;text-align:left;cursor:pointer;color:${theme.text}!important}
.cw-profile-row strong{display:block;font-size:12px;color:${theme.text}!important}
.cw-profile-row small{display:block;font-size:10px;color:${theme.textSecondary}!important}
.cw-profile-row>button:last-child{min-width:35px;min-height:40px;background:none;border:0;color:${theme.textSecondary}!important;cursor:pointer}
.cw-profile p{font-size:11px;color:${theme.textSecondary}!important;line-height:1.8}
.cw button:focus-visible,.cw-dialog button:focus-visible,.cw-dialog input:focus-visible,.cw-dialog textarea:focus-visible,.cw-dialog select:focus-visible{outline:2px solid ${theme.primary};outline-offset:3px}
` : `
.cw{height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;background:#fff;color:#141519;font:13px/1.5 Arial,Helvetica,sans-serif}.cw *,.cw-dialog *{box-sizing:border-box}.cw button,.cw-dialog button{border:0;background:none;font:inherit;color:inherit;cursor:pointer}.cw-head{position:sticky;top:0;z-index:4;padding:8px 16px 0;border-bottom:1px solid #e9e9ef;background:#fffffff7;backdrop-filter:blur(12px)}.cw-top,.cw-row{display:flex;align-items:center;justify-content:space-between;gap:10px}.cw-top{height:44px}.cw-top>div{display:flex;align-items:center;gap:5px}.cw-wordmark{font:800 30px Arial;letter-spacing:-1.8px}.cw-wordmark b{color:#ed177b}.cw-icon{width:40px;height:42px;display:inline-flex;align-items:center;justify-content:center}.cw h1{font-size:27px;letter-spacing:-.7px;margin:12px 0 4px}.cw-lead{font-size:12px;color:#777883;margin:0 0 14px}.cw-search{display:flex;align-items:center;gap:8px;padding:0 12px;background:#f6f6f9;border:1px solid #e7e7ed;border-radius:12px}.cw-search input{width:100%;min-width:0;background:none;border:0;outline:none;height:42px;font:12px Arial}.cw-tabs,.cw-section-tabs{display:flex;gap:23px;border-bottom:1px solid #e9e9ef}.cw-tabs button,.cw-section-tabs button{min-height:45px;border-bottom:2px solid transparent;color:#777883;font-size:12px;font-weight:600}.cw-tabs button[aria-selected=true],.cw-section-tabs button[aria-selected=true]{border-color:#ed177b;color:#141519}.cw-content{padding:17px 16px 25px}.cw-chips{display:flex;gap:7px;overflow:auto;scrollbar-width:none;margin-bottom:17px}.cw-chips button{min-height:36px;white-space:nowrap;padding:8px 12px;border:1px solid #e5e5eb;border-radius:20px;color:#6d6e79;font-size:11px}.cw-chips button[aria-pressed=true]{background:#17181e;color:white;border-color:#17181e}.cw-heading{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:19px 0 12px}.cw-heading h2{font-size:17px;letter-spacing:-.3px;margin:0}.cw-heading small,.cw-subtle{font-size:10px;color:#85858f}.cw-link{color:#c40a60!important;font-size:11px!important;min-height:36px;display:inline-flex;align-items:center;gap:5px}.cw-feature{background:#1c1d25;border-radius:16px;padding:17px;color:white}.cw-feature small{color:#f0a6cb;letter-spacing:1px;font-size:9px}.cw-feature h3{font-size:18px;letter-spacing:-.4px;margin:9px 0;font-weight:700}.cw-feature p{font-size:11px;color:#c1c1ce;line-height:1.8}.cw-feature .cw-link{color:white!important}.cw-exchange-logos{display:flex;align-items:center;gap:9px;margin:13px 0}.cw-mine-tray{display:flex;gap:13px;overflow:auto;margin-bottom:19px;padding-bottom:4px}.cw-mine-tray button{width:67px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:6px;font-size:9px}.cw-mine-tray button>span:last-child{max-width:67px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.cw-card{border:1px solid #e6e6ed;border-radius:16px;overflow:hidden;margin-bottom:16px;background:#fff}.cw-card-main{display:block;width:100%;padding:0!important;text-align:left}.cw-cover{height:120px;background:#252631;position:relative;overflow:hidden}.cw-cover img{width:100%;height:100%;object-fit:cover;opacity:.78}.cw-cover:after{content:'';position:absolute;inset:0;background:linear-gradient(transparent,#11121c66)}.cw-cover-label{position:absolute;z-index:1;right:11px;top:10px;font-size:9px;color:#fff;background:#11121c55;border:1px solid #ffffff66;border-radius:20px;padding:4px 8px}.cw-card-body{position:relative;padding:16px 14px 13px}.cw-card-body>.cw-avatar{position:absolute;top:-28px}.cw-card-label{font-size:9px;color:#8a8b94;text-align:right;min-height:20px}.cw-card h3{font-size:17px;font-weight:700;line-height:1.3;letter-spacing:-.3px;margin:7px 0 5px}.cw-card p{font-size:11px;color:#777883;line-height:1.7;margin:0 0 8px}.cw-card-bottom{display:flex;justify-content:space-between;gap:8px;align-items:center;border-top:1px solid #ededf1;padding:10px 14px}.cw-status{display:inline-flex;align-items:center;gap:4px;color:#a90b52;background:#fff0f6;border:1px solid #f6d5e5;border-radius:15px;padding:4px 8px;font-size:10px}.cw-primary{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px;background:#df0e70!important;color:white!important;font-size:12px!important;font-weight:700!important;border-radius:23px;padding:11px 17px!important}.cw-primary:disabled{opacity:.4;cursor:default}.cw-secondary{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:42px;border:1px solid #e3e3e9!important;background:#f8f8fa!important;border-radius:12px;padding:10px 14px!important;font-size:12px!important}.cw-actions{display:flex;gap:8px;flex-wrap:wrap}.cw-actions>.cw-primary{flex:1}.cw-empty{padding:24px 17px;text-align:center;border:1px dashed #dedee6;border-radius:15px;background:#fafafb;margin:15px 0}.cw-empty h3{font-size:15px}.cw-empty p,.cw-intro{font-size:12px;line-height:1.8;color:#777883}.cw-note{font:10px/1.8 Arial;color:#85858e;margin:17px 0}.cw-overlay{position:fixed;inset:0;background:#15151f66;z-index:10060;display:flex;justify-content:center}.cw-dialog{width:100%;max-width:430px;height:100dvh;overflow:auto;scrollbar-width:none;background:white;color:#141519;font:13px/1.5 Arial,Helvetica,sans-serif;outline:none}.cw-dialog-head{position:sticky;top:0;z-index:5;background:#fffffff5;backdrop-filter:blur(12px);border-bottom:1px solid #ededf2;display:flex;align-items:center;justify-content:space-between;padding:5px 12px;height:53px}.cw-dialog-head strong{font-size:12px}.cw-detail-cover{height:155px;background:#252631}.cw-detail-cover>img{width:100%;height:100%;object-fit:cover}.cw-detail-body{padding:0 18px 22px}.cw-identity{position:relative;display:flex;justify-content:space-between;align-items:flex-end;margin-top:-30px}.cw-detail-body h2{font-size:24px;letter-spacing:-.6px;line-height:1.2;margin:15px 0 8px}.cw-meta{font-size:11px;color:#777883;display:flex;gap:6px;align-items:center;flex-wrap:wrap}.cw-section-tabs{justify-content:space-between;gap:8px;margin-top:19px}.cw-section-tabs button{font-size:11px}.cw-activity{padding:15px;border:1px solid #e7e7ed;border-radius:14px;margin-top:13px}.cw-activity-top{display:flex;justify-content:space-between;gap:7px;color:#777883;font-size:9px}.cw-activity h3{font-size:15px;line-height:1.4;margin:10px 0 6px}.cw-activity p{font-size:11px;color:#767782;line-height:1.8;margin:8px 0;white-space:pre-wrap}.cw-person{display:flex;align-items:center;gap:10px;padding:14px 0;border-bottom:1px solid #ededf2}.cw-person>span:nth-child(2){flex:1}.cw-person strong{display:block;font-size:12px}.cw-person small{display:block;font-size:10px;color:#777883}.cw-person-bubble{height:34px;width:34px;display:flex;align-items:center;justify-content:center;background:#f1f1f5;border-radius:50%;font-weight:700;font-size:11px}.cw-form{padding:19px}.cw-form h2{font-size:25px;letter-spacing:-.6px;margin:4px 0 9px}.cw-form>p{font-size:12px;line-height:1.8;color:#777883}.cw-field{display:block;font-size:11px;font-weight:600;margin:17px 0 7px}.cw-input{display:block;width:100%;border:1px solid #e1e1e8;border-radius:11px;background:#f8f8fa;color:#22232c;padding:11px;font:12px Arial;min-height:43px}.cw-form textarea{min-height:95px;resize:vertical}.cw-check{display:flex;gap:9px;align-items:flex-start;font-size:11px;color:#72737e;line-height:1.8;margin:16px 0}.cw-check input{accent-color:#df0e70;margin-top:4px}.cw-callout{border:1px solid #f1d2e2;background:#fff4f9;border-radius:13px;padding:14px;margin:15px 0;font-size:12px;color:#873454;line-height:1.8}.cw-error{font-size:12px;color:#aa0c4b;background:#fff0f6;padding:11px;border-radius:10px;margin:14px 0}.cw-upload{border:1px dashed #d9d9e3;border-radius:12px;padding:13px;margin-top:8px;display:flex;align-items:center;gap:12px}.cw-upload label{font-size:11px;color:#bd0b5e}.cw-upload input{font-size:10px;max-width:220px;display:block;margin-top:8px}.cw-upload small{font-size:9px;color:#777883;display:block}.cw-post{padding:16px 0;border-bottom:1px solid #e8e8ee}.cw-post p{font-size:12px;color:#6d6e7a;line-height:1.8;white-space:pre-wrap}.cw-post strong{font-size:12px}.cw-profile{font:12px/1.5 Arial;margin:0 20px 23px;padding:17px;border:1px solid #e6e6ed;border-radius:16px;color:#141519;background:white}.cw-profile-title{display:flex;justify-content:space-between;align-items:center;gap:8px}.cw-profile-title h3{font-size:16px;margin:0}.cw-profile h4{font-size:10px;color:#81818c;letter-spacing:.6px;text-transform:uppercase;margin:17px 0 7px}.cw-profile-row{display:flex;gap:9px;align-items:center;margin-top:10px}.cw-profile-row>button:first-child{flex:1;display:flex;gap:10px;align-items:center;min-width:0;background:none;border:0;padding:0;text-align:left;cursor:pointer;color:#141519}.cw-profile-row strong{display:block;font-size:12px}.cw-profile-row small{display:block;font-size:10px;color:#777883}.cw-profile-row>button:last-child{min-width:35px;min-height:40px;background:none;border:0;color:#81818c;cursor:pointer}.cw-profile p{font-size:11px;color:#777883;line-height:1.8}.cw button:focus-visible,.cw-dialog button:focus-visible,.cw-dialog input:focus-visible,.cw-dialog textarea:focus-visible,.cw-dialog select:focus-visible{outline:2px solid #df0e70;outline-offset:3px}
`}
    </style>
  );
}
