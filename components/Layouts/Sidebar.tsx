import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { toggleSidebar } from '../../store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const Sidebar = () => {
    const router = useRouter();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const [helpOpen, setHelpOpen] = useState(false);
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [router.pathname, dispatch, themeConfig.sidebar]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed top-0 bottom-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <Image className="ml-[5px] h-8 w-auto flex-none" src="/assets/images/logos/logo-lobato-2.jpg" alt="Lobato Tours" width={120} height={32} />
                            <span className="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline"></span>
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="m-auto h-5 w-5">
                                <path d="M13 19L7 12L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path opacity="0.5" d="M16.9998 19L10.9998 12L16.9998 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <PerfectScrollbar className="relative flex-1 min-h-0">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'dashboard' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('dashboard')}>
                                    <div className="flex items-center">
                                        <svg className="group-hover:!text-primary shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                opacity="0.5"
                                                d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M9 17.25C8.58579 17.25 8.25 17.5858 8.25 18C8.25 18.4142 8.58579 18.75 9 18.75H15C15.4142 18.75 15.75 18.4142 15.75 18C15.75 17.5858 15.4142 17.25 15 17.25H9Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('dashboard')}</span>
                                    </div>

                                    <div className={currentMenu === 'dashboard' ? 'rotate-90' : 'rtl:rotate-180'}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'dashboard' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <Link href="/">{t('sales')}</Link>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/cotizaciones" className="nav-link group">
                                    <div className="flex items-center">
                                        <svg className="group-hover:!text-primary shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                opacity="0.5"
                                                d="M3 10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C21 4.34315 21 6.22876 21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3 19.6569 3 17.7712 3 14V10Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M8 7C8 6.44772 8.44772 6 9 6H15C15.5523 6 16 6.44772 16 7C16 7.55228 15.5523 8 15 8H9C8.44772 8 8 7.55228 8 7Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M8 11C8 10.4477 8.44772 10 9 10H15C15.5523 10 16 10.4477 16 11C16 11.5523 15.5523 12 15 12H9C8.44772 12 8 11.5523 8 11Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M8 15C8 14.4477 8.44772 14 9 14H13C13.5523 14 14 14.4477 14 15C14 15.5523 13.5523 16 13 16H9C8.44772 16 8 15.5523 8 15Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('quotes_nav')}</span>
                                    </div>
                                </Link>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/clientes/cotizador" className="nav-link group">
                                    <div className="flex items-center">
                                        <svg className="group-hover:!text-primary shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                opacity="0.5"
                                                d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M12 8V12L15 15"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('new_quote')}</span>
                                    </div>
                                </Link>
                            </li>







                        </ul>

                    </PerfectScrollbar>

                    {/* ── Help button ── pinned at the very bottom of the sidebar ── */}
                    <div className="shrink-0 px-4 pb-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setHelpOpen(!helpOpen)}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:text-gray-600 dark:hover:text-gray-400 dark:hover:bg-dark-light/10 transition-all duration-200 group"
                                title={t('help_documentation')}
                            >
                                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-xs font-bold group-hover:border-primary group-hover:text-primary transition-colors">?</span>
                                <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                                    {t('help')}
                                </span>
                            </button>

                            {helpOpen && (
                                <div className="absolute bottom-full left-0 mb-1 w-52 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black shadow-xl z-[100] overflow-hidden">
                                    <div className="px-3 py-2 bg-gray-50 dark:bg-dark-light/10 border-b border-gray-100 dark:border-gray-800">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {t('documentation')}
                                        </span>
                                    </div>
                                    <a
                                        href={i18n.language.startsWith('es') ? '/user-manual-es.html' : '/user-manual-en.html'}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => setHelpOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-colors"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 6H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                            <path d="M6 10H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                            <path opacity="0.5" d="M6 14H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                            <path opacity="0.5" d="M3 20.2895V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V15C21 16.1046 20.1046 17 19 17H7.37885C6.8167 17 6.2769 17.2277 5.88131 17.6321L3.7712 19.7789C3.62581 19.927 3.37419 19.927 3.2288 19.7789C3.08319 19.6306 3 19.4296 3 19.2203V20.2895Z" stroke="currentColor" strokeWidth="1.5"/>
                                        </svg>
                                        {t('user_manual')}
                                    </a>
                                    <a
                                        href={i18n.language.startsWith('es') ? '/admin-guide-es.html' : '/admin-guide-en.html'}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => setHelpOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary/5 hover:text-primary transition-colors border-t border-gray-100 dark:border-gray-800"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M19 11V10C19 6.13401 15.866 3 12 3C8.13401 3 5 6.13401 5 10V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                            <path opacity="0.5" d="M3 17C3 15.8954 3.89543 15 5 15H6C7.10457 15 8 15.8954 8 17V19C8 20.1046 7.10457 21 6 21H5C3.89543 21 3 20.1046 3 19V17Z" stroke="currentColor" strokeWidth="1.5"/>
                                            <path opacity="0.5" d="M16 17C16 15.8954 16.8954 15 18 15H19C20.1046 15 21 15.8954 21 17V19C21 20.1046 20.1046 21 19 21H18C16.8954 21 16 20.1046 16 19V17Z" stroke="currentColor" strokeWidth="1.5"/>
                                        </svg>
                                        {t('admin_guide')}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
